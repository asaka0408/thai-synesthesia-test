class TrialManager {
    constructor(onTrialChanged) {
        this.totalTrials = 60;
        this.currentIdx = 0;
        this.onTrialChanged = onTrialChanged;
        this.trialsList = [];
        this.generateTrials();
    }
    generateTrials() {
        const arabic = ['0','1','2','3','4','5','6','7','8','9'];
        const thai = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];
        let poolArabic = []; let poolThai = [];
        for (let i = 0; i < 3; i++) {
            poolArabic.push(...arabic);
            poolThai.push(...thai);
        }
        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };
        shuffle(poolArabic); shuffle(poolThai);
        for (let i = 0; i < 30; i++) this.trialsList.push({ symbol: poolArabic[i], script_type: "arabic" });
        for (let i = 0; i < 30; i++) this.trialsList.push({ symbol: poolThai[i], script_type: "thai" });
    }
    getCurrentTrial() {
        if (this.currentIdx < this.totalTrials) {
            return { ...this.trialsList[this.currentIdx], index: this.currentIdx + 1 };
        }
        return null;
    }
    next() {
        if (this.currentIdx < this.totalTrials) {
            this.currentIdx++;
            this.onTrialChanged(this.getCurrentTrial());
            return true;
        }
        return false;
    }
}