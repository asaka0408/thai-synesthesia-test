// app.js

// =====================
// Thai Numerals
// =====================

const thaiNumbers = [
  "๐","๑","๒","๓","๔",
  "๕","๖","๗","๘","๙"
];

const arabicNumbers = [
  "0","1","2","3","4",
  "5","6","7","8","9"
];

const arabicTrials = [];
const thaiTrials = [];

// =====================
// Create Trials
// =====================
arabicNumbers.forEach(symbol => {

  for(let i=0; i<3; i++) {

    arabicTrials.push(symbol);
  }
});

// shuffle only Arabic
arabicTrials.sort(
  () => Math.random() - 0.5
);

thaiNumbers.forEach(symbol => {

  for(let i=0; i<3; i++) {
    thaiTrials.push(symbol);
  }
});

// shuffle only Thai
thaiTrials.sort(
  () => Math.random() - 0.5
);

// combine
const trials = [
  ...arabicTrials,
  ...thaiTrials
];

// =====================
// Canvas
// =====================

const palette =
  document.getElementById("palette");

const paletteCtx =
  palette.getContext("2d");

const hueBar =
  document.getElementById("hue-bar");

const hueCtx =
  hueBar.getContext("2d");

const brightnessBar =
  document.getElementById("brightness-bar");

const brightnessCtx =
  brightnessBar.getContext("2d");

const preview =
  document.getElementById(
    "selected-color-preview"
  );

// =====================
// State
// =====================

let currentHue = 120;

let currentBrightness = 1;

// palette marker
let paletteMarker = {
  x: 300,
  y: 100
};

// hue marker
let hueMarkerY = 140;

// brightness marker
let brightnessMarkerX = 0;

let selectedColor = {
  r: 0,
  g: 255,
  b: 0,
  hex: "#00ff00"
};

// =====================
// Draw Hue Bar
// =====================

function drawHueBar() {

  const gradient =
    hueCtx.createLinearGradient(
      0,
      0,
      0,
      hueBar.height
    );

  for(let i=0; i<=360; i+=10) {

    gradient.addColorStop(
      i / 360,
      `hsl(${i},100%,50%)`
    );
  }

  hueCtx.clearRect(
    0,
    0,
    hueBar.width,
    hueBar.height
  );

  hueCtx.fillStyle = gradient;

  hueCtx.fillRect(
    0,
    0,
    hueBar.width,
    hueBar.height
  );

  // ===== marker =====

  hueCtx.strokeStyle = "white";
  hueCtx.lineWidth = 4;

  hueCtx.beginPath();

  hueCtx.moveTo(
    0,
    hueMarkerY
  );

  hueCtx.lineTo(
    hueBar.width,
    hueMarkerY
  );

  hueCtx.stroke();
}

// =====================
// Draw Brightness Bar
// =====================

function drawBrightnessBar() {

  const gradient =
    brightnessCtx.createLinearGradient(
      0,
      0,
      brightnessBar.width,
      0
    );

  gradient.addColorStop(
    0,
    "white"
  );

  gradient.addColorStop(
    1,
    "black"
  );

  brightnessCtx.clearRect(
    0,
    0,
    brightnessBar.width,
    brightnessBar.height
  );

  brightnessCtx.fillStyle =
    gradient;

  brightnessCtx.fillRect(
    0,
    0,
    brightnessBar.width,
    brightnessBar.height
  );

  // ===== marker =====

  brightnessCtx.strokeStyle =
    "white";

  brightnessCtx.lineWidth = 4;

  brightnessCtx.beginPath();

  brightnessCtx.moveTo(
    brightnessMarkerX,
    0
  );

  brightnessCtx.lineTo(
    brightnessMarkerX,
    brightnessBar.height
  );

  brightnessCtx.stroke();
}

// =====================
// Draw Palette
// =====================

function drawPalette() {

  for(let x=0; x<palette.width; x++) {

    for(let y=0; y<palette.height; y++) {

      const saturation =
        x / palette.width;

      const value =
        1 - (y / palette.height);

      const rgb =
        hsvToRgb(
          currentHue,
          saturation,
          value * currentBrightness
        );

      paletteCtx.fillStyle =
        `rgb(${rgb.r},${rgb.g},${rgb.b})`;

      paletteCtx.fillRect(
        x,
        y,
        1,
        1
      );
    }
  }

  // ===== circle marker =====

  paletteCtx.beginPath();

  paletteCtx.arc(
    paletteMarker.x,
    paletteMarker.y,
    12,
    0,
    Math.PI * 2
  );

  paletteCtx.strokeStyle =
    "white";

  paletteCtx.lineWidth = 4;

  paletteCtx.stroke();
}

// =====================
// HSV -> RGB
// =====================

function hsvToRgb(h, s, v) {

  let f = (
    n,
    k = (n + h / 60) % 6
  ) =>
    v - v * s * Math.max(
      Math.min(k, 4 - k, 1),
      0
    );

  return {

    r: Math.round(f(5) * 255),

    g: Math.round(f(3) * 255),

    b: Math.round(f(1) * 255)
  };
}

// =====================
// RGB -> HEX
// =====================

function rgbToHex(r, g, b) {

  return "#" +
    [r, g, b]
      .map(x => {

        const hex =
          x.toString(16);

        return hex.length === 1
          ? "0" + hex
          : hex;
      })
      .join("");
}

// =====================
// Update Preview Color
// =====================

function updateSelectedColor() {

  const saturation =
    paletteMarker.x / palette.width;

  const value =
    1 - (
      paletteMarker.y /
      palette.height
    );

  const rgb =
    hsvToRgb(
      currentHue,
      saturation,
      value * currentBrightness
    );

  selectedColor = {

    r: rgb.r,
    g: rgb.g,
    b: rgb.b,

    hex: rgbToHex(
      rgb.r,
      rgb.g,
      rgb.b
    )
  };

  // realtime update
  preview.style.background =
    selectedColor.hex;
}

// =====================
// Hue Select
// =====================

let draggingHue = false;

hueBar.addEventListener(
  "mousedown",
  () => {

    draggingHue = true;
  }
);

window.addEventListener(
  "mouseup",
  () => {

    draggingHue = false;
  }
);

hueBar.addEventListener(
  "mousemove",
  e => {

    if(!draggingHue) return;

    hueMarkerY = e.offsetY;

    currentHue =
      (e.offsetY /
      hueBar.height) * 360;

    drawHueBar();

    drawPalette();

    updateSelectedColor();
  }
);

// click対応も残す
hueBar.addEventListener(
  "click",
  e => {

    hueMarkerY = e.offsetY;

    currentHue =
      (e.offsetY /
      hueBar.height) * 360;

    drawHueBar();

    drawPalette();

    updateSelectedColor();
  }
);

// =====================
// Brightness Select
// =====================

let draggingBrightness = false;

brightnessBar.addEventListener(
  "mousedown",
  () => {

    draggingBrightness = true;
  }
);

window.addEventListener(
  "mouseup",
  () => {

    draggingBrightness = false;
  }
);

brightnessBar.addEventListener(
  "mousemove",
  e => {

    if(!draggingBrightness) return;

    brightnessMarkerX =
      e.offsetX;

    currentBrightness =
      1 - (
        e.offsetX /
        brightnessBar.width
      );

    drawBrightnessBar();

    drawPalette();

    updateSelectedColor();
  }
);

// click対応も残す
brightnessBar.addEventListener(
  "click",
  e => {

    brightnessMarkerX =
      e.offsetX;

    currentBrightness =
      1 - (
        e.offsetX /
        brightnessBar.width
      );

    drawBrightnessBar();

    drawPalette();

    updateSelectedColor();
  }
);

// =====================
// Palette Select
// =====================

palette.addEventListener(
  "click",
  e => {

    paletteMarker.x =
      e.offsetX;

    paletteMarker.y =
      e.offsetY;

    drawPalette();

    updateSelectedColor();
  }
);

// =====================
// Drag Support
// =====================

let draggingPalette = false;

palette.addEventListener(
  "mousedown",
  () => {

    draggingPalette = true;
  }
);

window.addEventListener(
  "mouseup",
  () => {

    draggingPalette = false;
  }
);

palette.addEventListener(
  "mousemove",
  e => {

    if(!draggingPalette) return;

    paletteMarker.x =
      e.offsetX;

    paletteMarker.y =
      e.offsetY;

    drawPalette();

    updateSelectedColor();
  }
);

// =====================
// Init
// =====================

drawHueBar();

drawBrightnessBar();

drawPalette();

updateSelectedColor();

// =====================
// DOM
// =====================

const startScreen = document.getElementById("start-screen");
const experimentScreen = document.getElementById("experiment-screen");
const endScreen = document.getElementById("end-screen");

const participantIdInput =
  document.getElementById("participant-id");

const sessionNumberInput =
  document.getElementById("session-number");

const startButton =
  document.getElementById("start-button");

const confirmColorButton = 
document.getElementById("confirm-color-button");

const noColorButton =
  document.getElementById("no-color-button");

const symbolDisplay =
  document.getElementById("symbol-display");

const colorPicker =
  document.getElementById("color-picker");

const progress =
  document.getElementById("progress");

// =====================
// State
// =====================

let participantId = "";
let sessionNumber = 1;

let currentTrial = 0;

let responses = [];

let trialStartTime = 0;

let noColor = false;

// =====================
// Start Experiment
// =====================

startButton.addEventListener("click", () => {

  participantId = participantIdInput.value.trim();

  sessionNumber = parseInt(
    sessionNumberInput.value
  );

  if(participantId === "") {
    alert("Participant ID required");
    return;
  }

  startScreen.classList.remove("active");
  experimentScreen.classList.add("active");

  showTrial();
});
// =====================
// Show Trial
// =====================

function showTrial() {

  const symbol = trials[currentTrial];

  symbolDisplay.textContent = symbol;

  progress.textContent =
    `${currentTrial + 1} / ${trials.length}`;

  preview.style.background = "white";
  selectedColor = null;

  noColor = false;
  paletteMarker = {
    x: 0,
    y: 0
    };

    document.querySelectorAll('input[name="color-reason"]').forEach(radio =>
         {radio.checked = false;});

    hueMarkerY = 0;
    brightnessMarkerX = 0;
    currentHue = 0;
    currentBrightness = 1;

    drawHueBar();
    drawBrightnessBar();
    drawPalette();
  trialStartTime = performance.now();
}

// =====================
// Next Trial
// =====================

async function saveAndNext() {

  const endTime = performance.now();

  const rt = endTime - trialStartTime;

  const symbol = trials[currentTrial];

  const isCompleted = currentTrial === trials.length - 1;

  responses.push({

    participant_id: participantId,

    session_number: sessionNumber,

    response_index: currentTrial + 1,

    script_type: currentTrial < 30
        ? "arabic"
        : "thai",

    symbol: symbol,

    color_hex: noColor
      ? null
      : selectedColor.hex,

    r: noColor
      ? null
      : selectedColor.r,

    g: noColor
      ? null
      : selectedColor.g,

    b: noColor
      ? null
      : selectedColor.b,

    no_color: noColor,

    reason: noColor
      ? null
      : getSelectedReason(),

    reaction_time_ms:
      Math.round(rt),

    timestamp:
      new Date().toISOString(),

    completed: isCompleted
  });

  await addDoc(

  collection(db, "responses"),

  {

    participant_id: participantId,

    session_number: sessionNumber,

    response_index: currentTrial + 1,

    symbol: symbol,

    color_hex: noColor
      ? null
      : selectedColor.hex,

    r: noColor
      ? null
      : selectedColor.r,

    g: noColor
      ? null
      : selectedColor.g,

    b: noColor
      ? null
      : selectedColor.b,

    no_color: noColor,

    reason: noColor
      ? null
      : getSelectedReason(),

    reaction_time_ms:
      Math.round(rt),

    timestamp:
      new Date().toISOString()
  }
);

console.log("saved");

  // reset noColor
  noColor = false;

  currentTrial++;

  if(currentTrial >= trials.length) {

    finishExperiment();

  } else {

    showTrial();
  }
}

confirmColorButton.addEventListener(

  "click",

  () => {

    // =====================
    // color selected?
    // =====================

    if(selectedColor === null) {

      alert(

        "色を選択してください。もし白を選択したい場合は、カーソルを少し動かし白を再選択してください。"

      );

      return;

    }

    // =====================
    // reason selected?
    // =====================

    const selectedReason =

      getSelectedReason();

    if(selectedReason === null) {

      alert(

        "色を選んだ根拠を選択してください"

      );

      return;

    }

    noColor = false;

    saveAndNext();

  }

);

noColorButton.addEventListener(
  "click",
  () => {

    noColor = true;

    saveAndNext();
  }
);

function getSelectedReason() {

  const checked =

    document.querySelector(

      'input[name="color-reason"]:checked'

    );

  return checked

    ? checked.value

    : null;

}

// =====================
// Finish
// =====================

function finishExperiment() {

  experimentScreen.classList.remove("active");
  endScreen.classList.add("active");

  console.log(responses);
}

// =====================
// HEX -> RGB
// =====================

function hexToRgb(hex) {

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}