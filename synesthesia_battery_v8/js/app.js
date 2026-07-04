document.addEventListener("DOMContentLoaded", () => {
    let selectedColorState = null;
    let trialManager = null;
    let viewer = null;
    const trajectoryManager = new TrajectoryManager();

    const elPreview = document.getElementById("color-preview");
    const elProgressText = document.getElementById("progress-text");
    const elProgressBarFill = document.getElementById("progress-bar-fill");
    const elStimulusChar = document.getElementById("stimulus-char");
    const btnSubmit = document.getElementById("btn-submit");
    const btnNoColor = document.getElementById("btn-nocolor");

    function updateColorUI(colorData) {
        if (!colorData) {
            elPreview.style.backgroundColor = "#ffffff";
            btnSubmit.disabled = true;
            return;
        }
        elPreview.style.backgroundColor = colorData.hex;
        btnSubmit.disabled = false;
    }

    function handleColorSelected(colorData) {
        selectedColorState = colorData;
        updateColorUI(colorData);
        trajectoryManager.recordSample(colorData.L, colorData.a, colorData.b);
    }

    // Handles peripheral rotational arc plotting when the mouse rests in the blank background
    function handleRotationTracked(nextL, nextA, nextB) {
        trajectoryManager.recordSample(nextL, nextA, nextB);
    }

    function handleTrialChanged(trial) {
        if (!trial) {
            alert("すべての実験セッションが正常に完了しました！");
            elStimulusChar.textContent = "終了";
            updateColorUI(null);
            return;
        }
        selectedColorState = null;
        updateColorUI(null);
        if (viewer) viewer.clearSelection();
        trajectoryManager.start();

        const checkedRadio = document.querySelector('input[name="reason"]:checked');
        if (checkedRadio) checkedRadio.checked = false;

        elProgressText.textContent = `${trial.index} / 60`;
        elProgressBarFill.style.width = `${(trial.index / 60) * 100}%`;
        elStimulusChar.textContent = trial.symbol;
    }

    async function submitResponse(isColorPresent) {
        const currentTrial = trialManager.getCurrentTrial();
        if (!currentTrial) return;

        const reasonRadio = document.querySelector('input[name="reason"]:checked');
        
        // [NEW REQUIREMENT]: If choosing "色を決定" (isColorPresent = true) but no reason is checked, raise alert and block.
        if (isColorPresent && !reasonRadio) {
            alert("色選択の根拠を選択してください。");
            return;
        }

        const reason = reasonRadio ? reasonRadio.value : (isColorPresent ? "直感" : "色なし");

        const payload = {
            response_index: currentTrial.index,
            script_type: currentTrial.script_type,
            symbol: currentTrial.symbol,
            reason: reason,
            has_color: isColorPresent,
            L: isColorPresent ? selectedColorState.L : null,
            a: isColorPresent ? selectedColorState.a : null,
            b: isColorPresent ? selectedColorState.b : null,
            HEX: isColorPresent ? selectedColorState.hex : null,
            trajectory: trajectoryManager.getTrajectoryData(),
            trajectory_distance: trajectoryManager.getDistance()
        };

        await SynesthesiaFirebase.saveTrial(payload);
        trialManager.next();
    }

    viewer = new ColorSpaceViewer("canvas-container", handleColorSelected, handleRotationTracked);
    trialManager = new TrialManager(handleTrialChanged);
    handleTrialChanged(trialManager.getCurrentTrial());

    btnSubmit.addEventListener("click", () => submitResponse(true));
    btnNoColor.addEventListener("click", () => submitResponse(false));
});