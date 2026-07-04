const SynesthesiaFirebase = (() => {
    async function saveTrial(trialData) {
        console.log("Saving data:", trialData);
        const history = JSON.parse(localStorage.getItem("syn_v3_trials") || "[]");
        trialData.timestamp = new Date().toISOString();
        history.push(trialData);
        localStorage.setItem("syn_v3_trials", JSON.stringify(history));
        return true;
    }
    return { saveTrial };
})();