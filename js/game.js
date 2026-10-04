let canvas;
let world;
let keyboard = new Keyboard();
let score = 0;

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

/**
 * Replaces any existing World with a freshly initialized game instance.
 */
function init() {
  canvas = document.getElementById("canvas");

  if (world && typeof world.destroy === "function") {
    world.destroy();
  }

  initLevel();
  world = new World(canvas, keyboard);
  window.world = world;
}

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      keyboard.LEFT = true;
      break;
    case "ArrowRight":
      keyboard.RIGHT = true;
      break;
    case "ArrowUp":
      keyboard.UP = true;
      break;
    case "ArrowDown":
      keyboard.DOWN = true;
      break;
    case " ":
      keyboard.SPACE = true;
      break;
    case "Shift":
      keyboard.SHIFT = true;
      break;
    case "Enter":
      keyboard.ENTER = true;
      break;
    default:
      break;
  }
});

window.addEventListener("keyup", (e) => {
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

const MOBILE_RUN_TO_ACTION_DELAY = 250;
const MOBILE_ACTION_TO_RUN_DELAY = 150;

const mobileControlSides = {
  left: {
    movementKey: "LEFT",
    actionKey: "SPACE",
    oppositeSide: "right",
    movementPressed: false,
    actionPressed: false,
    transferPending: false,
    transferActive: false,
    releaseTimer: null,
    returnTimer: null,
  },
  right: {
    movementKey: "RIGHT",
    actionKey: "SHIFT",
    oppositeSide: "left",
    movementPressed: false,
    actionPressed: false,
    transferPending: false,
    transferActive: false,
    releaseTimer: null,
    returnTimer: null,
  },
};

const mobileControlBindings = [
  { id: "leftBtn", side: "left", role: "movement", pointerId: null },
  { id: "jumpBtn", side: "left", role: "action", pointerId: null },
  { id: "rightBtn", side: "right", role: "movement", pointerId: null },
  { id: "throwBtn", side: "right", role: "action", pointerId: null },
];

/**
 * Connects the mobile controls to the existing keyboard state.
 */
function bindMobileControls() {
  mobileControlBindings.forEach(bindMobileControlButton);
  window.addEventListener("blur", resetMobileControlStates);
  document.addEventListener("visibilitychange", resetHiddenMobileControls);
}

/**
 * Binds pointer events for one mobile control button.
 *
 * @param {Object} binding - Mobile control configuration.
 */
function bindMobileControlButton(binding) {
  var button = document.getElementById(binding.id);
  if (!button) return;

  button.addEventListener("pointerdown", (event) => {
    activateMobileControl(event, binding);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
    button.addEventListener(eventName, (event) => {
      releaseMobileControl(event, binding);
    });
  });
}

/**
 * Activates one mobile control immediately.
 *
 * @param {PointerEvent} event - Pointer event from the control.
 * @param {Object} binding - Mobile control configuration.
 */
function activateMobileControl(event, binding) {
  event.preventDefault();
  binding.pointerId = event.pointerId;
  captureMobilePointer(event);
  var side = mobileControlSides[binding.side];

  if (binding.role === "movement") {
    pressMovementControl(side);
  } else {
    pressActionControl(side);
  }
}

/**
 * Captures a pointer for reliable release handling.
 *
 * @param {PointerEvent} event - Pointer event from the control.
 */
function captureMobilePointer(event) {
  if (event.currentTarget.setPointerCapture) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
}

/**
 * Releases the control associated with one pointer.
 *
 * @param {PointerEvent} event - Pointer event from the control.
 * @param {Object} binding - Mobile control configuration.
 */
function releaseMobileControl(event, binding) {
  if (binding.pointerId !== event.pointerId) return;
  event.preventDefault();
  binding.pointerId = null;
  var side = mobileControlSides[binding.side];

  if (binding.role === "movement") {
    releaseMovementControl(side);
  } else {
    releaseActionControl(side);
  }
}

/**
 * Activates movement and cancels the opposite direction.
 *
 * @param {Object} side - Mobile control side state.
 */
function pressMovementControl(side) {
  cancelOppositeMovement(side);
  clearMobileTimer(side, "releaseTimer");
  clearMobileTimer(side, "returnTimer");
  side.movementPressed = true;
  side.transferPending = false;
  side.transferActive = false;
  keyboard[side.movementKey] = true;
}

/**
 * Starts the run-to-action transfer window after movement release.
 *
 * @param {Object} side - Mobile control side state.
 */
function releaseMovementControl(side) {
  if (!side.movementPressed) return;
  side.movementPressed = false;
  clearMobileTimer(side, "returnTimer");

  if (side.actionPressed) {
    confirmMovementTransfer(side);
  } else {
    startMovementReleaseWindow(side);
  }
}

/**
 * Activates the action and confirms a pending movement transfer.
 *
 * @param {Object} side - Mobile control side state.
 */
function pressActionControl(side) {
  side.actionPressed = true;
  keyboard[side.actionKey] = true;

  if (side.transferPending) {
    confirmMovementTransfer(side);
  }
}

/**
 * Releases the action and starts the return window when needed.
 *
 * @param {Object} side - Mobile control side state.
 */
function releaseActionControl(side) {
  side.actionPressed = false;
  keyboard[side.actionKey] = false;

  if (side.transferActive && !side.movementPressed) {
    startMovementReturnWindow(side);
  }
}

/**
 * Keeps movement available while waiting for the paired action.
 *
 * @param {Object} side - Mobile control side state.
 */
function startMovementReleaseWindow(side) {
  clearMobileTimer(side, "releaseTimer");
  side.transferPending = true;
  side.releaseTimer = setTimeout(() => {
    side.transferPending = false;
    side.releaseTimer = null;
    if (!side.movementPressed && !side.transferActive) {
      keyboard[side.movementKey] = false;
    }
  }, MOBILE_RUN_TO_ACTION_DELAY);
}

/**
 * Keeps movement active through the paired action.
 *
 * @param {Object} side - Mobile control side state.
 */
function confirmMovementTransfer(side) {
  clearMobileTimer(side, "releaseTimer");
  side.transferPending = false;
  side.transferActive = true;
  keyboard[side.movementKey] = true;
}

/**
 * Keeps movement briefly active while returning to the run button.
 *
 * @param {Object} side - Mobile control side state.
 */
function startMovementReturnWindow(side) {
  clearMobileTimer(side, "returnTimer");
  side.transferActive = false;
  side.returnTimer = setTimeout(() => {
    side.returnTimer = null;
    if (!side.movementPressed) {
      keyboard[side.movementKey] = false;
    }
  }, MOBILE_ACTION_TO_RUN_DELAY);
}

/**
 * Cancels movement and transfer state on the opposite side.
 *
 * @param {Object} side - Newly activated movement side.
 */
function cancelOppositeMovement(side) {
  var opposite = mobileControlSides[side.oppositeSide];
  clearMobileTimer(opposite, "releaseTimer");
  clearMobileTimer(opposite, "returnTimer");
  opposite.movementPressed = false;
  opposite.transferPending = false;
  opposite.transferActive = false;
  keyboard[opposite.movementKey] = false;
}

/**
 * Clears one mobile control timer.
 *
 * @param {Object} side - Mobile control side state.
 * @param {string} timerName - Timer property name.
 */
function clearMobileTimer(side, timerName) {
  if (side[timerName] !== null) {
    clearTimeout(side[timerName]);
    side[timerName] = null;
  }
}

/**
 * Resets all mobile gameplay input states.
 */
function resetMobileControlStates() {
  Object.values(mobileControlSides).forEach(resetMobileControlSide);
  mobileControlBindings.forEach((binding) => {
    binding.pointerId = null;
  });
}

/**
 * Resets one mobile control side.
 *
 * @param {Object} side - Mobile control side state.
 */
function resetMobileControlSide(side) {
  clearMobileTimer(side, "releaseTimer");
  clearMobileTimer(side, "returnTimer");
  side.movementPressed = false;
  side.actionPressed = false;
  side.transferPending = false;
  side.transferActive = false;
  keyboard[side.movementKey] = false;
  keyboard[side.actionKey] = false;
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
