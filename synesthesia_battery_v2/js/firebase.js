// Firebase Module Mock / Integration Setup
const SynesthesiaFirebase = (() => {
    // Replace with actual firebase configuration if needed
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    let db = null;
    
    // Attempt initialization if firebase is loaded externally, otherwise mock it
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();
            console.log("Firebase initialized successfully.");
        }
    } catch (e) {
        console.warn("Firebase script not loaded or misconfigured. Running in Mock Mode.", e);
    }

    /**
     * Save a single trial response data to Firestore (or local storage/console in mock mode)
     */
    async function saveTrial(trialData) {
        console.log("Saving trial data:", trialData);
        
        if (db) {
            try {
                await db.collection("trials").add({
                    ...trialData,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                return true;
            } catch (error) {
                console.error("Error saving to Firestore:", error);
                // fallback to local storage
                saveToLocalStorage(trialData);
                return false;
            }
        } else {
            saveToLocalStorage(trialData);
            return true;
        }
    }

    function saveToLocalStorage(data) {
        const history = JSON.parse(localStorage.getItem("synesthesia_trials") || "[]");
        data.timestamp = new Date().toISOString();
        history.push(data);
        localStorage.setItem("synesthesia_trials", JSON.stringify(history));
    }

    return {
        saveTrial
    };
})();
