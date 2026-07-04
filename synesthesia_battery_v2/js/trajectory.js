// Trajectory management module
class TrajectoryManager {
    constructor() {
        this.points = []; // Stores objects: { time: ms, L: val, a: val, b: val }
        this.startTime = null;
        this.totalDistance = 0.0;
    }

    start() {
        this.points = [];
        this.startTime = performance.now();
        this.totalDistance = 0.0;
        this.updateUI();
    }

    recordSample(L, a, b) {
        if (this.startTime === null) return;
        
        const currentTime = performance.now() - this.startTime;
        const currentPoint = { time: currentTime, L, a, b };

        if (this.points.length > 0) {
            const lastPoint = this.points[this.points.length - 1];
            // Compute CIELAB Delta E (Euclidean distance in Lab space)
            const dL = currentPoint.L - lastPoint.L;
            const da = currentPoint.a - lastPoint.a;
            const db = currentPoint.b - lastPoint.b;
            const distance = Math.sqrt(dL * dL + da * da + db * db);
            
            // Only add point and accumulate distance if there's an actual change
            if (distance > 0.01) {
                this.totalDistance += distance;
                this.points.push(currentPoint);
                this.updateUI();
            }
        } else {
            this.points.push(currentPoint);
            this.updateUI();
        }
    }

    reset() {
        this.points = [];
        this.totalDistance = 0.0;
        if (this.startTime !== null) {
            this.startTime = performance.now();
        }
        this.updateUI();
    }

    getTrajectoryData() {
        return this.points;
    }

    getDistance() {
        return this.totalDistance;
    }

    updateUI() {
        const lenElement = document.getElementById("trajectory-len-val");
        if (lenElement) {
            lenElement.textContent = this.totalDistance.toFixed(2);
        }
    }
}
