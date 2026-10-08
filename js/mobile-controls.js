const MOBILE_RUN_TO_ACTION_DELAY = 250;
const MOBILE_ACTION_TO_RUN_DELAY = 150;

const mobileControlSides = {
  left: {
    movementKey: "LEFT",
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
  { id: "leftBtn", side: "left", role: "movement", key: "LEFT", pointerId: null },
  { id: "leftJumpBtn", side: "left", role: "action", key: "SPACE", pointerId: null },
  { id: "leftThrowBtn", side: "left", role: "action", key: "SHIFT", pointerId: null },
  { id: "rightBtn", side: "right", role: "movement", key: "RIGHT", pointerId: null },
  { id: "rightJumpBtn", side: "right", role: "action", key: "SPACE", pointerId: null },
  { id: "rightThrowBtn", side: "right", role: "action", key: "SHIFT", pointerId: null },
];

/** Connects all mobile controls to the shared keyboard state. */
function bindMobileControls() {
  mobileControlBindings.forEach(bindMobileControlButton);
  window.addEventListener("blur", resetMobileControlStates);
  document.addEventListener("visibilitychange", resetHiddenMobileControls);
}

/** Binds pointer activation and release events for one touch control. */
function bindMobileControlButton(binding) {
  var button = document.getElementById(binding.id);
  if (!button) return;
  button.addEventListener("contextmenu", preventMobileContextMenu);
  button.addEventListener("pointerdown", function (event) {
    activateMobileControl(event, binding);
  });
  bindMobileReleaseEvents(button, binding);
}

/** Prevents the browser context menu on dedicated mobile game controls. */
function preventMobileContextMenu(event) {
  event.preventDefault();
}

/** Binds all pointer events that release one touch control. */
function bindMobileReleaseEvents(button, binding) {
  var releaseEvents = ["pointerup", "pointercancel", "lostpointercapture"];
  releaseEvents.forEach(function (eventName) {
    button.addEventListener(eventName, function (event) {
      releaseMobileControl(event, binding);
    });
  });
}

/** Activates one mobile control immediately. */
function activateMobileControl(event, binding) {
  event.preventDefault();
  binding.pointerId = event.pointerId;
  captureMobilePointer(event);
  var side = mobileControlSides[binding.side];
  if (binding.role === "movement") {
    pressMovementControl(side);
    return;
  }
  pressActionControl(side, binding);
}

/** Captures a pointer so release events remain reliable. */
function captureMobilePointer(event) {
  if (event.currentTarget.setPointerCapture) {
    event.currentTarget.setPointerCapture(event.pointerId);
  }
}

/** Releases only the control owned by the matching pointer. */
function releaseMobileControl(event, binding) {
  if (binding.pointerId !== event.pointerId) return;
  event.preventDefault();
  binding.pointerId = null;
  var side = mobileControlSides[binding.side];
  if (binding.role === "movement") {
    releaseMovementControl(side);
    return;
  }
  releaseActionControl(side, binding);
}

/** Activates movement and cancels only the opposite movement direction. */
function pressMovementControl(side) {
  cancelOppositeMovement(side);
  clearMobileTimer(side, "releaseTimer");
  clearMobileTimer(side, "returnTimer");
  side.movementPressed = true;
  side.transferPending = false;
  side.transferActive = false;
  keyboard[side.movementKey] = true;
}

/** Starts the run-to-action transfer window after movement release. */
function releaseMovementControl(side) {
  if (!side.movementPressed) return;
  side.movementPressed = false;
  clearMobileTimer(side, "returnTimer");
  if (side.actionPressed) {
    confirmMovementTransfer(side);
    return;
  }
  startMovementReleaseWindow(side);
}

/** Activates Jump or Throw without disturbing the same action on the other side. */
function pressActionControl(side, binding) {
  side.actionPressed = true;
  keyboard[binding.key] = true;
  if (binding.key === "SPACE") registerJumpPress();
  if (side.transferPending) confirmMovementTransfer(side);
}

/** Releases one Jump or Throw button while preserving duplicate held input. */
function releaseActionControl(side, binding) {
  syncSharedActionKey(binding.key);
  side.actionPressed = isSideActionPressed(binding.side);
  if (!side.actionPressed && side.transferActive && !side.movementPressed) {
    startMovementReturnWindow(side);
  }
}

/** Synchronizes a shared keyboard action with both matching touch buttons. */
function syncSharedActionKey(key) {
  keyboard[key] = mobileControlBindings.some(function (binding) {
    return binding.role === "action" &&
      binding.key === key &&
      binding.pointerId !== null;
  });
}

/** Returns whether either action button is still held on one side. */
function isSideActionPressed(sideName) {
  return mobileControlBindings.some(function (binding) {
    return binding.side === sideName &&
      binding.role === "action" &&
      binding.pointerId !== null;
  });
}

/** Keeps movement available while waiting for a same-side action. */
function startMovementReleaseWindow(side) {
  clearMobileTimer(side, "releaseTimer");
  side.transferPending = true;
  side.releaseTimer = setTimeout(function () {
    side.transferPending = false;
    side.releaseTimer = null;
    if (!side.movementPressed && !side.transferActive) {
      keyboard[side.movementKey] = false;
    }
  }, MOBILE_RUN_TO_ACTION_DELAY);
}

/** Keeps movement active through a same-side Jump or Throw action. */
function confirmMovementTransfer(side) {
  clearMobileTimer(side, "releaseTimer");
  side.transferPending = false;
  side.transferActive = true;
  keyboard[side.movementKey] = true;
}

/** Keeps movement briefly active while returning to the direction button. */
function startMovementReturnWindow(side) {
  clearMobileTimer(side, "returnTimer");
  side.transferActive = false;
  side.returnTimer = setTimeout(function () {
    side.returnTimer = null;
    if (!side.movementPressed) {
      keyboard[side.movementKey] = false;
    }
  }, MOBILE_ACTION_TO_RUN_DELAY);
}

/** Cancels movement and transfer state on the opposite side only. */
function cancelOppositeMovement(side) {
  var opposite = mobileControlSides[side.oppositeSide];
  clearMobileTimer(opposite, "releaseTimer");
  clearMobileTimer(opposite, "returnTimer");
  opposite.movementPressed = false;
  opposite.transferPending = false;
  opposite.transferActive = false;
  keyboard[opposite.movementKey] = false;
}

/** Clears one mobile movement-transfer timer. */
function clearMobileTimer(side, timerName) {
  if (side[timerName] === null) return;
  clearTimeout(side[timerName]);
  side[timerName] = null;
}

/** Resets all touch pointers, movement state, and shared action keys. */
function resetMobileControlStates() {
  Object.values(mobileControlSides).forEach(function (side) {
    resetMobileControlSide(side);
  });
  mobileControlBindings.forEach(function (binding) {
    binding.pointerId = null;
  });
  keyboard.SPACE = false;
  keyboard.SHIFT = false;
}

/** Resets one side of the mobile movement-transfer state. */
function resetMobileControlSide(side) {
  clearMobileTimer(side, "releaseTimer");
  clearMobileTimer(side, "returnTimer");
  side.movementPressed = false;
  side.actionPressed = false;
  side.transferPending = false;
  side.transferActive = false;
  keyboard[side.movementKey] = false;
}

/** Resets mobile input whenever the page becomes hidden. */
function resetHiddenMobileControls() {
  if (document.hidden) resetMobileControlStates();
}

bindMobileControls();
