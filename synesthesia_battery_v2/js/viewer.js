// 3D Color Space Viewer Module using Three.js
class ColorSpaceViewer {
    constructor(containerId, onColorSelected, onHoverColor) {
        this.container = document.getElementById(containerId);
        this.onColorSelected = onColorSelected;
        this.onHoverColor = onHoverColor;
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.colorPointsMesh = null;
        this.pointsData = []; // Maps particle index to Lab/RGB data
        this.selectedMarker = null;
        
        this.init();
    }

    init() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
        this.camera.position.set(150, 100, 150);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Grid & Axes Indicators
        this.buildAxesLines();

        // Build CIELAB Point Cloud Sphere
        this.buildColorSphereCloud();

        // Marker for Selected Color
        const markerGeo = new THREE.SphereGeometry(2, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        this.selectedMarker = new THREE.Mesh(markerGeo, markerMat);
        this.selectedMarker.visible = false;
        this.scene.add(this.selectedMarker);

        // Events
        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('click', (e) => this.onClick(e));
        this.renderer.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Start Animation Loop
        this.animate();
    }

    buildAxesLines() {
        // Create subtle helper lines representing L*, a*, b* axes
        const matWhite = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
        const matRed = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5 });
        const matGreen = new THREE.LineBasicMaterial({ color: 0x44ff44, transparent: true, opacity: 0.5 });
        const matBlue = new THREE.LineBasicMaterial({ color: 0x4444ff, transparent: true, opacity: 0.5 });
        const matYellow = new THREE.LineBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.5 });

        // L* vertical axis (Y-axis in Three.js) from -50 to 50
        const geoL = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -50, 0), new THREE.Vector3(0, 50, 0)]);
        const lineL = new THREE.Line(geoL, matWhite);
        this.scene.add(lineL);

        // a* axis (X-axis in Three.js) from -50 (green) to 50 (red)
        const geoA = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-50, 0, 0), new THREE.Vector3(50, 0, 0)]);
        const lineA = new THREE.Line(geoA, matRed);
        this.scene.add(lineA);

        // b* axis (Z-axis in Three.js) from -50 (blue) to 50 (yellow)
        const geoB = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -50), new THREE.Vector3(0, 0, 50)]);
        const lineB = new THREE.Line(geoB, matBlue);
        this.scene.add(lineB);
    }

    buildColorSphereCloud() {
        // Sample points within the RGB bounding box mapped into CIELAB space
        const positions = [];
        const colors = [];
        this.pointsData = [];

        // Simple grid sampling of RGB color space, converting valid values to Lab mapping coordinates
        // To form a sphere shell/solid look, we sample coordinates directly in Lab and filter for RGB validity
        const step = 4; 
        for (let lVal = 10; lVal <= 90; lVal += step) {
            for (let aVal = -80; aVal <= 80; aVal += step) {
                for (let bVal = -80; bVal <= 80; bVal += step) {
                    
                    // Check if it forms a sphere roughly or within valid bounds
                    const distFromCenter = Math.sqrt(aVal*aVal + bVal*bVal);
                    if (distFromCenter > 75) continue; // bound check

                    const rgb = this.lab2rgb(lVal, aVal, bVal);
                    // Filter: only include coordinates that fall into valid standard sRGB gamuts
                    if (rgb.r >= 0 && rgb.r <= 255 && rgb.g >= 0 && rgb.g <= 255 && rgb.b >= 0 && rgb.b <= 255) {
                        
                        // Three.js mappings:
                        // Y = L* (centered at 0, so lVal - 50)
                        // X = a*
                        // Z = b*
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

        // Use custom point cloud material
        const material = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.75
        });

        this.colorPointsMesh = new THREE.Points(geometry, material);
        this.scene.add(this.colorPointsMesh);
    }

    // CIELAB to sRGB Conversion formulas
    lab2rgb(L, a, b) {
        let y = (L + 16) / 116;
        let x = a / 500 + y;
        let z = y - b / 200;

        let x3 = x * x * x;
        let y3 = y * y * y;
        let z3 = z * z * z;

        x = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
        y = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
        z = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

        // Observer = 2°, Illuminant = D65
        let X = x * 95.047;
        let Y = y * 100.000;
        let Z = z * 108.883;

        // Convert XYZ to RGB
        let _X = X / 100;
        let _Y = Y / 100;
        let _Z = Z / 100;

        let r = _X * 3.2406 + _Y * -1.5372 + _Z * -0.4986;
        let g = _X * -0.9689 + _Y * 1.8758 + _Z * 0.0415;
        let bl = _X * 0.0557 + _Y * -0.2040 + _Z * 1.0570;

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
        return "#" + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join("");
    }

    getIntersectedPoint(e) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Add threshold adjustment for point click accuracy
        this.raycaster.params.Points.threshold = 2.0;

        const intersects = this.raycaster.intersectObject(this.colorPointsMesh);
        if (intersects.length > 0) {
            const index = intersects[0].index;
            return this.pointsData[index];
        }
        return null;
    }

    onClick(e) {
        const colorData = this.getIntersectedPoint(e);
        if (colorData) {
            // Update indicator ring position
            this.selectedMarker.position.set(colorData.a, colorData.L - 50, colorData.b);
            this.selectedMarker.visible = true;
            this.onColorSelected(colorData);
        }
    }

    onMouseMove(e) {
        const colorData = this.getIntersectedPoint(e);
        if (colorData && this.onHoverColor) {
            this.onHoverColor(colorData);
        }
    }

    clearSelection() {
        this.selectedMarker.visible = false;
    }

    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
