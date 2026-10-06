/**
 * Controls responsive touch placement and viewport orientation behavior.
 */
function showMobileControls() {
  var controls = document.getElementById("mobileControls");
  if (!controls) return;
  controls.classList.add("isActive");
  updateMobileControlLayout();
}

/** Updates whether touch controls sit outside or over the game stage. */
function updateMobileControlLayout() {
  var controls = document.getElementById("mobileControls");
  var stage = document.getElementById("gameStage");
  var button = document.getElementById("leftBtn");
  if (!controls || !stage || !button || !controls.classList.contains("isActive")) return;

  var touchControlsEnabled = supportsTouchControls();
  controls.classList.toggle("touchControlsEnabled", touchControlsEnabled);
  if (!touchControlsEnabled || !isLandscapeViewport()) {
    controls.classList.remove("controlsOutsideStage", "controlsOverlayStage");
    return;
  }

  var stageRect = stage.getBoundingClientRect();
  var buttonWidth = button.getBoundingClientRect().width;
  var leftSpace = stageRect.left;
  var rightSpace = window.innerWidth - stageRect.right;
  var controlsFitOutside = leftSpace >= buttonWidth + 8 && rightSpace >= buttonWidth + 8;
  setMobileControlMode(
    controls,
    controlsFitOutside,
    leftSpace,
    rightSpace,
    buttonWidth,
    stageRect,
  );
}

/** Returns whether touch-oriented controls should be available. */
function supportsTouchControls() {
  return (
    window.matchMedia("(any-pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

/** Returns whether the current viewport is landscape. */
function isLandscapeViewport() {
  return window.matchMedia("(orientation: landscape)").matches;
}

/** Applies outside-stage or overlay-stage placement to touch controls. */
function setMobileControlMode(
  controls,
  fitOutside,
  leftSpace,
  rightSpace,
  buttonWidth,
  stageRect,
) {
  controls.classList.toggle("controlsOutsideStage", fitOutside);
  controls.classList.toggle("controlsOverlayStage", !fitOutside);
  if (fitOutside) {
    setMobileOutsideOffsets(controls, leftSpace, rightSpace, buttonWidth);
    return;
  }
  setMobileOverlayOffset(controls, stageRect);
}

/** Centers touch columns in the free space beside the canvas. */
function setMobileOutsideOffsets(controls, leftSpace, rightSpace, buttonWidth) {
  controls.style.setProperty(
    "--left-control-offset",
    Math.max(8, (leftSpace - buttonWidth) / 2) + "px",
  );
  controls.style.setProperty(
    "--right-control-offset",
    Math.max(8, (rightSpace - buttonWidth) / 2) + "px",
  );
}

/** Places overlay touch controls below the mobile HUD row. */
function setMobileOverlayOffset(controls, stageRect) {
  var hudBottom = getMobileHudBottom();
  var canvasHeight = window.world && window.world.canvas
    ? window.world.canvas.height
    : 480;
  var hudBottomCss = stageRect.top + (hudBottom / canvasHeight) * stageRect.height;
  controls.style.setProperty("--overlay-control-top", hudBottomCss + 12 + "px");
}

/** Returns the bottom edge of the mobile HUD row in canvas coordinates. */
function getMobileHudBottom() {
  if (window.world && typeof window.world.getMobileHudLayout === "function") {
    return window.world.getMobileHudLayout().bottom;
  }
  return 60;
}

let orientationResizeTimer = null;

/** Updates the portrait-orientation overlay after resize activity settles. */
function checkOrientation() {
  if (orientationResizeTimer) clearTimeout(orientationResizeTimer);
  orientationResizeTimer = setTimeout(function () {
    updateOrientationOverlay();
  }, 400);
}

/** Shows or hides the portrait-orientation overlay for the current viewport. */
function updateOrientationOverlay() {
  var overlay = document.getElementById("orientationOverlay");
  var rotateBtn = document.getElementById("rotateButton");
  if (!overlay) return;
  if (window.innerHeight > window.innerWidth) {
    showPortraitOrientationOverlay(overlay, rotateBtn);
    return;
  }
  overlay.style.display = "none";
}

/** Shows the rotate notice and refreshes its browser layout state. */
function showPortraitOrientationOverlay(overlay, rotateBtn) {
  overlay.style.display = "flex";
  requestAnimationFrame(function () {
    overlay.style.transform = "translateZ(0)";
  });
  updateRotateButtonVisibility(rotateBtn);
}

/** Shows the automatic rotate button only when orientation locking exists. */
function updateRotateButtonVisibility(rotateBtn) {
  if (!rotateBtn) return;
  rotateBtn.style.display = supportsOrientationLock()
    ? "inline-block"
    : "none";
}

/** Returns whether the browser exposes screen-orientation locking. */
function supportsOrientationLock() {
  return (
    typeof screen.orientation !== "undefined" &&
    typeof screen.orientation.lock === "function"
  );
}

/** Requests fullscreen mode and landscape orientation when supported. */
function rotateDevice() {
  var elem = document.documentElement;
  if (!elem.requestFullscreen) {
    handleUnsupportedFullscreen();
    return;
  }
  elem.requestFullscreen()
    .then(function () {
      requestLandscapeOrientation();
    })
    .catch(function (error) {
      handleFullscreenFailure(error);
    });
}

/** Requests landscape orientation after fullscreen was granted. */
function requestLandscapeOrientation() {
  if (!supportsOrientationLock()) {
    handleUnsupportedOrientationLock();
    return;
  }
  screen.orientation.lock("landscape").catch(function (error) {
    handleRotationFailure(error);
  });
}

/** Reports a blocked orientation-lock request. */
function handleRotationFailure(error) {
  console.warn("⚠️ Rotation request was blocked:", error);
  alert(
    "Your browser blocked automatic rotation.\nPlease rotate your device manually.",
  );
}

/** Reports a browser without screen-orientation locking. */
function handleUnsupportedOrientationLock() {
  console.warn(
    "🚫 screen.orientation.lock() not supported on this device/browser.",
  );
  alert(
    "Automatic rotation not supported.\nPlease rotate your device manually.",
  );
}

/** Reports a blocked fullscreen request. */
function handleFullscreenFailure(error) {
  console.warn("⚠️ Fullscreen request was blocked:", error);
  alert(
    "Fullscreen activation failed.\nPlease rotate your device manually.",
  );
}

/** Reports a browser without fullscreen support. */
function handleUnsupportedFullscreen() {
  console.warn(
    "🚫 requestFullscreen() not supported on this device/browser.",
  );
  alert(
    "Your browser does not support fullscreen mode.\nPlease rotate manually.",
  );
}

window.addEventListener("resize", checkOrientation);
window.addEventListener("resize", updateMobileControlLayout);
window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("orientationchange", updateMobileControlLayout);
window.addEventListener("load", checkOrientation);
