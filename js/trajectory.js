class TrajectoryManager {
    constructor() {
        this.points = [];
        this.startTime = null;
        this.totalDistance = 0.0;
        this.lastSampleTime = 0;
        this.sampleInterval = 1000 / 60;
    }
    start() {
        this.points = [];
        this.startTime = performance.now();
        this.totalDistance = 0.0;
        this.lastSampleTime = 0;
        this.updateUI();
    }
    recordSample(L, a, b) {
        if (this.startTime === null) return;
        const currentTime = performance.now() - this.startTime;
        if (currentTime - this.lastSampleTime < this.sampleInterval) return; 
        const currentPoint = { time: currentTime, L, a, b };
        if (this.points.length > 0) {
            const last = this.points[this.points.length - 1];
            const dL = currentPoint.L - last.L;
            const da = currentPoint.a - last.a;
            const db = currentPoint.b - last.b;
            const distance = Math.sqrt(dL*dL + da*da + db*db);
            this.totalDistance += distance;
        }
        this.points.push(currentPoint);
        this.lastSampleTime = currentTime;
        this.updateUI();
    }
    reset() {
        this.points = [];
        this.totalDistance = 0.0;
        if (this.startTime !== null) this.startTime = performance.now();
        this.lastSampleTime = 0;
        this.updateUI();
    }
    getTrajectoryData() { return this.points; }
    getDistance() { return this.totalDistance; }
    updateUI() {
        const el = document.getElementById("trajectory-len-val");
        if (el) el.textContent = this.totalDistance.toFixed(2);
    }
}