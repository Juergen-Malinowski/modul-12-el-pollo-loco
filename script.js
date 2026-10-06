/**
 * Reads a named game color from the shared CSS palette.
 *
 * @param {string} variableName - CSS custom property name.
 * @returns {string} Resolved color value.
 */
function getGameColor(variableName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

/**
 * Starts a fresh game world and activates the gameplay UI.
 */
function startGame() {
  resetCurrentLevel();
  score = 0;
  if (typeof resetHighscoreRunState === "function") resetHighscoreRunState();

  var start = document.getElementById("startScreen");
  if (start) {
    start.style.display = "none";
  }

  var cvs = document.getElementById("canvas");
  if (cvs) {
    cvs.style.display = "block";
  }

  if (typeof init === "function") {
    init();
  }

  activateGameplayUi();
}

/**
 * Activates controls, background music, and the shared canvas sound handler.
 */
function activateGameplayUi() {
  showMobileControls();
  if (
    typeof soundHub !== "undefined" &&
    soundHub &&
    typeof soundHub.playBackgroundMusic === "function"
  ) {
    soundHub.playBackgroundMusic();
  }
  if (typeof bindGlobalCanvasSoundHandler === "function") {
    bindGlobalCanvasSoundHandler();
  }
}

/**
 * Opens the static transition dialog after a successful level.
 */
function showLevelTransition(completedLevel, nextLevel) {
  var overlay = document.getElementById("levelTransitionOverlay");
  var title = document.getElementById("levelTransitionTitle");
  var text = document.getElementById("levelTransitionText");
  var button = document.getElementById("startNextLevelButton");
  if (!overlay || !title || !text) return;

  title.textContent = "Level " + completedLevel + " completed!";
  text.textContent = "Ready for Level " + nextLevel + "?";
  overlay.style.display = "flex";
  if (button) button.focus();
}

/** Hides the level transition dialog. */
function closeLevelTransition() {
  var overlay = document.getElementById("levelTransitionOverlay");
  if (overlay) overlay.style.display = "none";
}

/**
 * Starts the next level while preserving the accumulated run score.
 */
function startNextLevel() {
  closeLevelTransition();
  if (typeof advanceLevel === "function") advanceLevel();
  activateGameplayUi();
}

var __prevHtmlOverflow = "";
var __prevBodyOverflow = "";

/**
 * Opens the Impressum iframe while temporarily restoring document scrolling.
 */
function openImpressum() {
  var overlay = document.getElementById("impressumOverlay");
  var frame = document.getElementById("impressumFrame");

  __prevHtmlOverflow = document.documentElement.style.overflow;
  __prevBodyOverflow = document.body.style.overflow;

  document.documentElement.style.overflow = "auto";
  document.body.style.overflow = "auto";

  if (frame) {
    frame.src = "./info.html";
  }
  if (overlay) {
    overlay.style.display = "flex";
  }
}

/**
 * Closes the Impressum iframe and restores the previous overflow state.
 */
function closeImpressum() {
  var overlay = document.getElementById("impressumOverlay");
  var frame = document.getElementById("impressumFrame");

  if (overlay) {
    overlay.style.display = "none";
  }
  if (frame) {
    frame.src = "";
  }

  document.documentElement.style.overflow = __prevHtmlOverflow;
  document.body.style.overflow = __prevBodyOverflow;
}

/**
 * Synchronizes the audio controls with the current SoundHub state.
 */
function syncAudioUIFromSoundHub() {
  var musicSlider = document.getElementById("musicVolume");
  var effectsSlider = document.getElementById("effectVolume");
  var muteBtn = document.getElementById("toggleMuteButton");

  if (typeof soundHub === "undefined" || !soundHub) {
    return;
  }

  if (musicSlider && typeof soundHub.getMusicVolume === "function") {
    var mv = soundHub.getMusicVolume();
    if (typeof mv === "number") musicSlider.value = mv;
  }

  if (effectsSlider && typeof soundHub.getEffectsVolume === "function") {
    var ev = soundHub.getEffectsVolume();
    if (typeof ev === "number") effectsSlider.value = ev;
  }

  if (muteBtn) {
    if (soundHub.isMuted) {
      muteBtn.textContent = "🔇 Sound is OFF (click to change)";
    } else {
      muteBtn.textContent = "🔊 Sound is ON (click to change)";
    }
  }
}

/**
 * Opens the audio settings overlay and refreshes its control values.
 */
function openAudioSettings() {
  var overlay = document.getElementById("audioOverlay");
  if (overlay) {
    overlay.style.display = "flex";
  }

  syncAudioUIFromSoundHub();
}

function closeAudioSettings() {
  var overlay = document.getElementById("audioOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

function openGameControl() {
  document.getElementById("gameControlOverlay").style.display = "flex";
}

function closeGameControl() {
  document.getElementById("gameControlOverlay").style.display = "none";
}

/** Opens the gameplay help overlay. */
function openHelp() {
  document.getElementById("helpOverlay").style.display = "flex";
}

/** Closes the gameplay help overlay. */
function closeHelp() {
  document.getElementById("helpOverlay").style.display = "none";
}

/**
 * Applies the selected music volume and refreshes the audio UI.
 * @param {string|number} value - Slider value between 0 and 1.
 */
function updateMusicVolume(value) {
  if (
    typeof soundHub !== "undefined" &&
    soundHub &&
    typeof soundHub.setMusicVolume === "function"
  ) {
    soundHub.setMusicVolume(value);
  }
  syncAudioUIFromSoundHub();
}

/**
 * Applies the selected effects volume and refreshes the audio UI.
 * @param {string|number} value - Slider value between 0 and 1.
 */
function updateEffectVolume(value) {
  if (
    typeof soundHub !== "undefined" &&
    soundHub &&
    typeof soundHub.setEffectsVolume === "function"
  ) {
    soundHub.setEffectsVolume(value);
  }
  syncAudioUIFromSoundHub();
}

/**
 * Toggles the global mute state and refreshes the audio UI.
 */
function toggleMuteAll() {
  if (
    typeof soundHub !== "undefined" &&
    soundHub &&
    typeof soundHub.toggleMute === "function"
  ) {
    soundHub.toggleMute();
  }
  syncAudioUIFromSoundHub();
}

function showMobileControls() {
  var controls = document.getElementById("mobileControls");
  if (!controls) return;

  controls.classList.add("isActive");
  updateMobileControlLayout();
}

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

function supportsTouchControls() {
  return (
    window.matchMedia("(any-pointer: coarse)").matches ||
    navigator.maxTouchPoints > 0
  );
}

function isLandscapeViewport() {
  return window.matchMedia("(orientation: landscape)").matches;
}

function setMobileControlMode(controls, fitOutside, leftSpace, rightSpace, buttonWidth, stageRect) {
  controls.classList.toggle("controlsOutsideStage", fitOutside);
  controls.classList.toggle("controlsOverlayStage", !fitOutside);

  if (fitOutside) {
    setMobileOutsideOffsets(controls, leftSpace, rightSpace, buttonWidth);
  } else {
    setMobileOverlayOffset(controls, stageRect);
  }
}

function setMobileOutsideOffsets(controls, leftSpace, rightSpace, buttonWidth) {
  controls.style.setProperty("--left-control-offset", Math.max(8, (leftSpace - buttonWidth) / 2) + "px");
  controls.style.setProperty("--right-control-offset", Math.max(8, (rightSpace - buttonWidth) / 2) + "px");
}

function setMobileOverlayOffset(controls, stageRect) {
  var hudBottom = getMobileHudBottom();
  var canvasHeight = window.world && window.world.canvas ? window.world.canvas.height : 480;
  var hudBottomCss = stageRect.top + (hudBottom / canvasHeight) * stageRect.height;
  controls.style.setProperty("--overlay-control-top", hudBottomCss + 12 + "px");
}

function getMobileHudBottom() {
  if (window.world && typeof window.world.getMobileHudLayout === "function") {
    return window.world.getMobileHudLayout().bottom;
  }
  return 60;
}

let orientationResizeTimer = null;

/**
 * Updates the portrait-orientation overlay after viewport resizing has settled.
 */
function checkOrientation() {
  if (orientationResizeTimer) {
    clearTimeout(orientationResizeTimer);
  }
  orientationResizeTimer = setTimeout(function () {
    var overlay = document.getElementById("orientationOverlay");
    var rotateBtn = document.getElementById("rotateButton");

    if (!overlay) {
      return;
    }
    if (window.innerHeight > window.innerWidth) {
      overlay.style.display = "flex";

      // Forces a second layout pass after emulated orientation changes.
      requestAnimationFrame(() => {
        overlay.style.transform = "translateZ(0)";
      });
      if (
        rotateBtn &&
        typeof screen.orientation !== "undefined" &&
        typeof screen.orientation.lock === "function"
      ) {
        rotateBtn.style.display = "inline-block";
      } else if (rotateBtn) {
        rotateBtn.style.display = "none";
      }
    } else {
      overlay.style.display = "none";
    }
  }, 400);
}

/**
 * Requests fullscreen mode and landscape orientation when supported.
 */
function rotateDevice() {
  var elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem
      .requestFullscreen()
      .then(function () {
        if (
          typeof screen.orientation !== "undefined" &&
          typeof screen.orientation.lock === "function"
        ) {
          screen.orientation
            .lock("landscape")
            .then(function () {
            })
            .catch(function (error) {
              console.warn("⚠️ Rotation request was blocked:", error);
              alert(
                "Your browser blocked automatic rotation.\nPlease rotate your device manually.",
              );
            });
        } else {
          console.warn(
            "🚫 screen.orientation.lock() not supported on this device/browser.",
          );
          alert(
            "Automatic rotation not supported.\nPlease rotate your device manually.",
          );
        }
      })
      .catch(function (error) {
        console.warn("⚠️ Fullscreen request was blocked:", error);
        alert(
          "Fullscreen activation failed.\nPlease rotate your device manually.",
        );
      });
  } else {
    console.warn(
      "🚫 requestFullscreen() not supported on this device/browser.",
    );
    alert(
      "Your browser does not support fullscreen mode.\nPlease rotate manually.",
    );
  }
}

window.addEventListener("resize", checkOrientation);
window.addEventListener("resize", updateMobileControlLayout);
window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("orientationchange", updateMobileControlLayout);
window.addEventListener("load", checkOrientation);

/**
 * Rebinds the global canvas sound-icon handler without duplicating listeners.
 */
function bindGlobalCanvasSoundHandler() {
  var canvas = document.getElementById("canvas");
  if (!canvas) return;

  if (window.__canvasSoundHandler) {
    canvas.removeEventListener("mousedown", window.__canvasSoundHandler);
    window.__canvasSoundHandler = null;
  }

  window.__canvasSoundHandler = function (event) {
    if (!window.world) return;

    var coordinates = getCanvasCoordinates(event, canvas);
    var x = coordinates.x;
    var y = coordinates.y;

    if (typeof window.world.handleHudClick === "function") {
      window.world.handleHudClick(x, y);
    } else if (typeof window.world.handleSoundIconClick === "function") {
      window.world.handleSoundIconClick(x, y);
    }
  };

  canvas.addEventListener("mousedown", window.__canvasSoundHandler);
}
