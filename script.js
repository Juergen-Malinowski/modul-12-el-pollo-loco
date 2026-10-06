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
