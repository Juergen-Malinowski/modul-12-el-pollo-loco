let canvas; // Canvas-Element anlegen
let world; // Variable für die Welt (World) anlegen
let keyboard = new Keyboard(); // Variablen für Rückmeldung des "keydown" in "keyboard" anlegen
let score = 0; // Globale SCORE-Zählvariable für Spielpunkte

// ##################################
// Nur für TEST, später löschen
// ##################################
if (
  typeof soundHub === "undefined" &&
  typeof window !== "undefined" &&
  window.soundHub
) {
  var soundHub = window.soundHub;
}
console.log("SoundHub verfügbar?", typeof soundHub);

/**
 * Converts pointer coordinates from the displayed canvas size
 * to the canvas' internal coordinate system.
 *
 * @param {MouseEvent} event - Pointer event on the canvas.
 * @param {HTMLCanvasElement} canvasElement - Canvas receiving the event.
 * @returns {{x: number, y: number}} Internal canvas coordinates.
 */
function getCanvasCoordinates(event, canvasElement) {
  const rect = canvasElement.getBoundingClientRect();
  const scaleX = canvasElement.width / rect.width;
  const scaleY = canvasElement.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function init() {
  // grundsätzliche Einbindung für canvas und Darstellungsart (2D/3D) ...
  canvas = document.getElementById("canvas");

  if (world && typeof world.destroy === "function") {
    world.destroy();
  }

  initLevel(); // jetzt wird Welt erschaffen
  world = new World(canvas, keyboard); // Welt anlegen und Canvas (id canvas) und gedrückte Taste übergeben
  window.world = world; // Sicherstellen, dass nach einem "Restart" immer nur eine aktive Welt existiert.
}

window.addEventListener("keydown", (e) => {
  // ACHTUNG:  "keypress" ist veraltet und wird nicht zu 100 % unterstützt (und analysiert nicht alle Tasten !). Deshalb "keydown" !!!
  switch (e.key) {
    // EVENT "keydown" auslesen und in einer der Variablen "keyboard" speichern (TRUE) ...
    case "ArrowLeft": // KEY = linker Pfeil / KEYCODE = 37
      keyboard.LEFT = true;
      break;
    case "ArrowRight": // KEY = rechter Pfeil / KEYCODE = 39
      keyboard.RIGHT = true;
      break;
    case "ArrowUp": // KEY = linker Pfeil / KEYCODE = 38
      keyboard.UP = true;
      break;
    case "ArrowDown": // KEY = linker Pfeil / KEYCODE = 40
      keyboard.DOWN = true;
      break;
    case " ": // KEY = linker Pfeil / KEYCODE = 32
      keyboard.SPACE = true;
      break;
    case "Shift": // KEY = linker Pfeil / KEYCODE = 16
      keyboard.SHIFT = true;
      break;
    case "Enter": // KEY = linker Pfeil / KEYCODE = 13
      keyboard.ENTER = true;
      break;
    default:
      break;
  }
});

window.addEventListener("keyup", (e) => {
  // SOBALD eine Taste wieder losgelassen wird, wird die entsprechende Variable von "keyboard" wieder auf FALSE gesetzt ...
  switch (e.code) {
    case "ArrowLeft":
      keyboard.LEFT = false;
      break;
    case "ArrowRight":
      keyboard.RIGHT = false;
      break;
    case "ArrowUp":
      keyboard.UP = false;
      break;
    case "ArrowDown":
      keyboard.DOWN = false;
      break;
    case "Space":
      keyboard.SPACE = false;
      break;
    case "ShiftLeft":
    case "ShiftRight":
      keyboard.SHIFT = false;
      break;
    case "Enter":
      keyboard.ENTER = false;
      break;
  }
});

const mobileControlBindings = [
  { id: "leftBtn", key: "LEFT" },
  { id: "rightBtn", key: "RIGHT" },
  { id: "jumpBtn", key: "SPACE" },
  { id: "throwBtn", key: "SHIFT" },
];

/**
 * Connects the mobile controls to the existing keyboard state.
 */
function bindMobileControls() {
  mobileControlBindings.forEach((binding) => {
    bindMobileControlButton(binding.id, binding.key);
  });
  window.addEventListener("blur", resetMobileControlStates);
  document.addEventListener("visibilitychange", resetHiddenMobileControls);
}

/**
 * Binds pointer events for one mobile control button.
 *
 * @param {string} buttonId - Button element id.
 * @param {string} keyboardKey - Keyboard state property.
 */
function bindMobileControlButton(buttonId, keyboardKey) {
  var button = document.getElementById(buttonId);
  if (!button) return;

  button.addEventListener("pointerdown", (event) => {
    activateMobileControl(event, keyboardKey);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
    button.addEventListener(eventName, (event) => {
      releaseMobileControl(event, keyboardKey);
    });
  });
}

/**
 * Activates one gameplay input and captures its pointer.
 *
 * @param {PointerEvent} event - Pointer event from the control.
 * @param {string} keyboardKey - Keyboard state property.
 */
function activateMobileControl(event, keyboardKey) {
  event.preventDefault();
  keyboard[keyboardKey] = true;
  if (event.currentTarget.setPointerCapture) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
}

/**
 * Releases one gameplay input.
 *
 * @param {PointerEvent} event - Pointer event from the control.
 * @param {string} keyboardKey - Keyboard state property.
 */
function releaseMobileControl(event, keyboardKey) {
  event.preventDefault();
  keyboard[keyboardKey] = false;
}

/**
 * Resets all mobile gameplay input states.
 */
function resetMobileControlStates() {
  keyboard.LEFT = false;
  keyboard.RIGHT = false;
  keyboard.SPACE = false;
  keyboard.SHIFT = false;
}

/**
 * Resets mobile input when the page becomes hidden.
 */
function resetHiddenMobileControls() {
  if (document.hidden) {
    resetMobileControlStates();
  }
}

bindMobileControls();
