// Master Orchestrator Script for Synesthesia Battery V2
document.addEventListener("DOMContentLoaded", () => {
    let selectedColorState = null;
    let trialManager = null;
    let viewer = null;
    const trajectoryManager = new TrajectoryManager();

    // Elements Dom Cache
    const elPreview = document.getElementById("color-preview");
    const elL = document.getElementById("val-l");
    const elA = document.getElementById("val-a");
    const elB = document.getElementById("val-b");
    const elR = document.getElementById("val-r");
    const elG = document.getElementById("val-g");
    const elB_rgb = document.getElementById("val-b-rgb");
    const elHex = document.getElementById("val-hex");
    
    const elProgressText = document.getElementById("progress-text");
    const elProgressBarFill = document.getElementById("progress-bar-fill");
    const elStimulusChar = document.getElementById("stimulus-char");
    
    const btnSubmit = document.getElementById("btn-submit");
    const btnNoColor = document.getElementById("btn-nocolor");
    const btnResetTrajectory = document.getElementById("btn-reset-trajectory");
    const chkShowTrajectory = document.getElementById("chk-show-trajectory");

    // Initialize State variables
    function updateColorUI(colorData) {
        if (!colorData) {
            elPreview.style.backgroundColor = "#ffffff";
            elL.textContent = "--"; elA.textContent = "--"; elB.textContent = "--";
            elR.textContent = "--"; elG.textContent = "--"; elB_rgb.textContent = "--";
            elHex.textContent = "#------";
            btnSubmit.disabled = true;
            return;
        }

        elPreview.style.backgroundColor = colorData.hex;
        elL.textContent = colorData.L.toFixed(2);
        elA.textContent = colorData.a.toFixed(2);
        elB.textContent = colorData.b.toFixed(2);
        elR.textContent = colorData.r;
        elG.textContent = colorData.g;
        elB_rgb.textContent = colorData.b;
        elHex.textContent = colorData.hex;

        btnSubmit.disabled = false;
    }

    // Callbacks from 3D View port
    function handleColorSelected(colorData) {
        selectedColorState = colorData;
        updateColorUI(colorData);
        trajectoryManager.recordSample(colorData.L, colorData.a, colorData.b);
    }

    function handleColorHover(colorData) {
        // Record trajectory continuously if user hovers/explores colors inside the space
        trajectoryManager.recordSample(colorData.L, colorData.a, colorData.b);
    }

    // Handle Trial changes UI state updates
    function handleTrialChanged(trial) {
        if (!trial) {
            // Task completed layout display
            alert("すべての実験セッションが正常に完了しました！データを保存しました。");
            elStimulusChar.textContent = "終了";
            updateColorUI(null);
            return;
        }

        // Reset per-trial states
        selectedColorState = null;
        updateColorUI(null);
        viewer.clearSelection();
        trajectoryManager.start();

        // Clear radio checkboxes selection
        const checkedRadio = document.querySelector('input[name="reason"]:checked');
        if (checkedRadio) checkedRadio.checked = false;

        // Progress components
        elProgressText.textContent = `${trial.index} / 60`;
        elProgressBarFill.style.width = `${(trial.index / 60) * 100}%`;
        elStimulusChar.textContent = trial.symbol;
    }

    // Form Submissions
    async function submitResponse(isColorPresent) {
        const currentTrial = trialManager.getCurrentTrial();
        if (!currentTrial) return;

        const reasonRadio = document.querySelector('input[name="reason"]:checked');
        const reason = reasonRadio ? reasonRadio.value : (isColorPresent ? "直感" : "色なし");

        const dataPayload = {
            participant_id: "test_user_v2", // Could be parameterized
            session_number: 1,
            response_index: currentTrial.index,
            script_type: currentTrial.script_type,
            symbol: currentTrial.symbol,
            reason: reason,
            has_color: isColorPresent,
            L: isColorPresent ? selectedColorState.L : null,
            a: isColorPresent ? selectedColorState.a : null,
            b: isColorPresent ? selectedColorState.b : null,
            R: isColorPresent ? selectedColorState.r : null,
            G: isColorPresent ? selectedColorState.g : null,
            B: isColorPresent ? selectedColorState.b : null,
            HEX: isColorPresent ? selectedColorState.hex : null,
            trajectory: trajectoryManager.getTrajectoryData(),
            trajectory_distance: trajectoryManager.getDistance()
        };

        // Save using Firebase implementation module
        await SynesthesiaFirebase.saveTrial(dataPayload);

        // Move onward
        trialManager.next();
    }

    // Core Init Bootstrapping
    viewer = new ColorSpaceViewer("canvas-container", handleColorSelected, handleColorHover);
    trialManager = new TrialManager(handleTrialChanged);

    // Initial Trigger setup
    handleTrialChanged(trialManager.getCurrentTrial());

    // Event Bindings
    btnSubmit.addEventListener("click", () => submitResponse(true));
    btnNoColor.addEventListener("click", () => submitResponse(false));
    btnResetTrajectory.addEventListener("click", () => trajectoryManager.reset());
});
