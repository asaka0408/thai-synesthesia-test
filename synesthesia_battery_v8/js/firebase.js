const SynesthesiaFirebase = (() => {
    async function saveTrial(trialData) {
        console.log("Saving data:", trialData);
        const history = JSON.parse(localStorage.getItem("syn_v8_trials") || "[]");
        trialData.timestamp = new Date().toISOString();
        history.push(trialData);
        localStorage.setItem("syn_v8_trials", JSON.stringify(history));
        return true;
    }
    return { saveTrial };
})();