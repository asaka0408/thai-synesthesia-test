// Trial Management Logic Block
class TrialManager {
    constructor(onTrialChanged) {
        this.totalTrials = 60;
        this.currentIdx = 0; // 0 to 59
        this.onTrialChanged = onTrialChanged;
        
        // Generate experimental items sequence: 30 Arabic, 30 Thai numbers
        this.trialsList = [];
        this.generateTrials();
    }

    generateTrials() {
        const arabicNumbers = ['0','1','2','3','4','5','6','7','8','9'];
        const thaiNumbers = ['０','１','２','３','４','５','６','７','８','９']; // Mocking with fullwidth or distinct shapes for display demo
        // Real Thai scripts can be inputted here: ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙']
        const realThai = ['๐','๑','๒','๓','๔','๕','๖','๗','๘','๙'];

        let poolArabic = [];
        let poolThai = [];

        // Each repeated 3 times
        for (let i = 0; i < 3; i++) {
            poolArabic.push(...arabicNumbers);
            poolThai.push(...realThai);
        }

        // Shuffle helper
        const shuffle = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        shuffle(poolArabic);
        shuffle(poolThai);

        // First 30 trials Arabic, next 30 trials Thai
        for (let i = 0; i < 30; i++) {
            this.trialsList.push({ symbol: poolArabic[i], script_type: "arabic" });
        }
        for (let i = 0; i < 30; i++) {
            this.trialsList.push({ symbol: poolThai[i], script_type: "thai" });
        }
    }

    getCurrentTrial() {
        if (this.currentIdx < this.totalTrials) {
            return {
                ...this.trialsList[this.currentIdx],
                index: this.currentIdx + 1
            };
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

    isFinished() {
        return this.currentIdx >= this.totalTrials;
    }
}
