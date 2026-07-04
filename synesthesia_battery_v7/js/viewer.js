class ColorSpaceViewer {
    constructor(containerId, onColorSelected) {
        this.container = document.getElementById(containerId);
        this.onColorSelected = onColorSelected;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Cache screen coordinates to re-raycast on scroll zoom
        this.lastClientX = 0;
        this.lastClientY = 0;
        
        this.colorPointsMesh = null;
        this.pointsData = [];
        
        // Interaction flags
        this.isRightDragging = false;
        
        // Rotation variables for right-click drag
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotationRadius = 150;
        this.theta = Math.PI / 4; 
        this.phi = Math.PI / 3;   
        
        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        this.updateCameraPosition();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        this.buildAxesLines();
        this.buildHighDensityColorSphereCloud();

        // [MODIFIED] White point marker completely removed to eliminate confusion and visual artifacts.

        // Disable native browser context menu on right-click to avoid interrupting dragging
        this.renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Mouse down handler - Using Right Click (button 2) for robust rotation without OS constraints
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                this.isRightDragging = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });
        
        window.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isRightDragging = false;
            }
        });

        // Mousemove updates position unconditionally (no click required) + handles right-drag rotation
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            this.lastClientX = e.clientX;
            this.lastClientY = e.clientY;

            if (this.isRightDragging) {
                const deltaX = e.clientX - this.previousMousePosition.x;
                const deltaY = e.clientY - this.previousMousePosition.y;

                this.theta -= deltaX * 0.007;
                this.phi -= deltaY * 0.007;
                this.phi = Math.max(0.01, Math.min(Math.PI - 0.01, this.phi));

                this.updateCameraPosition();
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }

            // Always sample currently targeted color and append trajectory info (no click required)
            this.checkIntersectionAndSelect(e.clientX, e.clientY);
        });

        // Wheel Scroll Zooming: Triggers real-time re-selection under the static cursor position
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = 1.05;
            if (e.deltaY < 0) {
                this.rotationRadius /= zoomFactor;
            } else {
                this.rotationRadius *= zoomFactor;
            }
            this.rotationRadius = Math.max(20, Math.min(400, this.rotationRadius));
            this.updateCameraPosition();

            // Real-time recalculation of color selection during zooming
            if (this.lastClientX && this.lastClientY) {
                this.checkIntersectionAndSelect(this.lastClientX, this.lastClientY);
            }
        }, { passive: false });

        window.addEventListener('resize', () => this.onWindowResize());
        this.animate();
    }

    updateCameraPosition() {
        this.camera.position.x = this.rotationRadius * Math.sin(this.phi) * Math.sin(this.theta);
        this.camera.position.y = this.rotationRadius * Math.cos(this.phi);
        this.camera.position.z = this.rotationRadius * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.lookAt(0, 0, 0);
    }

    buildAxesLines() {
        const matWhite = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
        const geoL = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -50, 0), new THREE.Vector3(0, 50, 0)]);
        this.scene.add(new THREE.Line(geoL, matWhite));
    }

    buildHighDensityColorSphereCloud() {
        const positions = [];
        const colors = [];
        this.pointsData = [];
        const step = 2; 

        for (let lVal = 10; lVal <= 90; lVal += step) {
            for (let aVal = -80; aVal <= 80; aVal += step) {
                for (let bVal = -80; bVal <= 80; bVal += step) {
                    if (Math.sqrt(aVal*aVal + bVal*bVal) > 75) continue;

                    const rgb = this.lab2rgb(lVal, aVal, bVal);
                    if (rgb.r >= 0 && rgb.r <= 255 && rgb.g >= 0 && rgb.g <= 255 && rgb.b >= 0 && rgb.b <= 255) {
                        positions.push(aVal, lVal - 50, bVal);
                        colors.push(rgb.r / 255, rgb.g / 255, rgb.b / 255);
                        this.pointsData.push({
                            L: lVal, a: aVal, b: bVal,
                            r: rgb.r, g: rgb.g, b: rgb.b,
                            hex: this.rgbToHex(rgb.r, rgb.g, rgb.b)
                        });
                    }
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({ size: 2.8, vertexColors: true, transparent: true, opacity: 0.95 });
        this.colorPointsMesh = new THREE.Points(geometry, material);
        this.scene.add(this.colorPointsMesh);
    }

    lab2rgb(L, a, b) {
        let y = (L + 16) / 116;
        let x = a / 500 + y;
        let z = y - b / 200;
        x = x * x * x > 0.008856 ? x * x * x : (x - 16 / 116) / 7.787;
        y = y * y * y > 0.008856 ? y * y * y : (y - 16 / 116) / 7.787;
        z = z * z * z > 0.008856 ? z * z * z : (z - 16 / 116) / 7.787;
        let X = x * 95.047; let Y = y * 100.0; let Z = z * 108.883;
        let r = (X/100) * 3.2406 + (Y/100) * -1.5372 + (Z/100) * -0.4986;
        let g = (X/100) * -0.9689 + (Y/100) * 1.8758 + (Z/100) * 0.0415;
        let bl = (X/100) * 0.0557 + (Y/100) * -0.2040 + (Z/100) * 1.0570;
        r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
        g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
        bl = bl > 0.0031308 ? 1.055 * Math.pow(bl, 1 / 2.4) - 0.055 : 12.92 * bl;
        return {
            r: Math.round(Math.max(0, Math.min(255, r * 255))),
            g: Math.round(Math.max(0, Math.min(255, g * 255))),
            b: Math.round(Math.max(0, Math.min(255, bl * 255)))
        };
    }

    rgbToHex(r, g, b) {
        return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join("");
    }

    checkIntersectionAndSelect(clientX, clientY) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        this.raycaster.params.Points.threshold = 1.0;

        const intersects = this.raycaster.intersectObject(this.colorPointsMesh);
        if (intersects.length > 0) {
            intersects.sort((x, y) => x.distance - y.distance);
            
            const index = intersects[0].index;
            const colorData = this.pointsData[index];
            this.onColorSelected(colorData);
        }
    }

    clearSelection() {
        // No marker to clear
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.renderer.render(this.scene, this.camera);
    }
}
