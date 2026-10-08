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

var gameStartLoading = false;
var initialGameAssetsReady = false;
var initialGameAssetsLoaded = 0;

var INITIAL_GAME_ASSETS = [
  "./assets/img/2_charakter_pepe/2_walk/W-21.webp",
  "./assets/img/2_charakter_pepe/2_walk/W-22.webp",
  "./assets/img/2_charakter_pepe/2_walk/W-23.webp",
  "./assets/img/2_charakter_pepe/2_walk/W-24.webp",
  "./assets/img/2_charakter_pepe/2_walk/W-25.webp",
  "./assets/img/2_charakter_pepe/2_walk/W-26.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-31.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-33.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-34.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-35.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-36.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-37.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-38.webp",
  "./assets/img/2_charakter_pepe/3_jump/J-39.webp",
  "./assets/img/2_charakter_pepe/5_dead/D-51.webp",
  "./assets/img/2_charakter_pepe/5_dead/D-52.webp",
  "./assets/img/2_charakter_pepe/5_dead/D-53.webp",
  "./assets/img/2_charakter_pepe/5_dead/D-54.webp",
  "./assets/img/2_charakter_pepe/5_dead/D-55.webp",
  "./assets/img/2_charakter_pepe/5_dead/D-56.webp",
  "./assets/img/2_charakter_pepe/4_hurt/H-41.webp",
  "./assets/img/2_charakter_pepe/4_hurt/H-42.webp",
  "./assets/img/2_charakter_pepe/4_hurt/H-43.webp",
  "./assets/img/2_charakter_pepe/1_idle/idle/I-1.webp",
  "./assets/img/2_charakter_pepe/1_idle/idle/I-4.webp",
  "./assets/img/2_charakter_pepe/1_idle/idle/I-7.webp",
  "./assets/img/2_charakter_pepe/1_idle/idle/I-8.webp",
  "./assets/img/2_charakter_pepe/1_idle/idle/I-9.webp",
  "./assets/img/2_charakter_pepe/1_idle/idle/I-10.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-11.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-12.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-13.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-14.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-15.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-16.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-17.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-18.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-19.webp",
  "./assets/img/2_charakter_pepe/1_idle/long_idle/I-20.webp",
  "./assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png",
  "./assets/img/3_feinde_huehner/chicken_normal/1_walk/2_w.png",
  "./assets/img/3_feinde_huehner/chicken_normal/1_walk/3_w.png",
  "./assets/img/3_feinde_huehner/chicken_normal/2_dead/dead.png",
  "./assets/img/3_feinde_huehner/chicken_small/1_walk/1_w.png",
  "./assets/img/3_feinde_huehner/chicken_small/1_walk/2_w.png",
  "./assets/img/3_feinde_huehner/chicken_small/1_walk/3_w.png",
  "./assets/img/3_feinde_huehner/chicken_small/2_dead/dead.png",
  "./assets/img/5_hintergrund/layers/air.png",
  "./assets/img/5_hintergrund/layers/1_first_layer/1.webp",
  "./assets/img/5_hintergrund/layers/1_first_layer/2.webp",
  "./assets/img/5_hintergrund/layers/2_second_layer/1.webp",
  "./assets/img/5_hintergrund/layers/2_second_layer/2.webp",
  "./assets/img/5_hintergrund/layers/3_third_layer/1.png",
  "./assets/img/5_hintergrund/layers/3_third_layer/2.png",
  "./assets/img/5_hintergrund/layers/4_clouds/1.png",
  "./assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png",
  "./assets/img/6_salsa_flasche/salsa_bottle.png",
  "./assets/img/8_muenzen/coin_2.png",
  "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
  "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
  "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
  "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
  "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png",
  "./assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png",
  "./assets/img/7_statusbars/2_statusbar_endboss/green/green100.png",
  "./assets/img/flying_bat/bat_mid.webp",
  "./assets/img/flying_bat/bat_up.webp",
  "./assets/img/flying_bat/bat_down.webp"
]

/** Starts a fresh game after the first-frame assets are available. */
function startGame() {
  if (gameStartLoading) return;
  if (initialGameAssetsReady) {
    beginFreshGame();
    return;
  }
  gameStartLoading = true;
  initialGameAssetsLoaded = 0;
  showGameLoading();
  preloadInitialGameAssets().then(function () {
    initialGameAssetsReady = true;
    gameStartLoading = false;
    beginFreshGame();
  }).catch(function (error) {
    handleInitialGameLoadError(error);
  });
}

/** Keeps the loading overlay visible when a critical startup image fails. */
function handleInitialGameLoadError(error) {
  gameStartLoading = false;
  console.error("Critical game asset failed to load:", error);
  var label = document.getElementById("gameLoadingPercent");
  if (label) label.textContent = "Load error";
}

/** Initializes the existing gameplay flow after startup loading. */
function beginFreshGame() {
  resetCurrentLevel();
  score = 0;
  if (typeof resetHighscoreRunState === "function") resetHighscoreRunState();
  hideStartScreen();
  showGameCanvas();
  if (typeof init === "function") init();
  hideGameLoading();
  activateGameplayUi();
}

/** Hides the start menu before gameplay becomes visible. */
function hideStartScreen() {
  var start = document.getElementById("startScreen");
  if (start) start.style.display = "none";
}

/** Shows the game Canvas after the startup preload. */
function showGameCanvas() {
  var canvas = document.getElementById("canvas");
  if (canvas) canvas.style.display = "block";
}

/** Shows and resets the startup loading overlay. */
function showGameLoading() {
  var overlay = document.getElementById("gameLoadingOverlay");
  if (overlay) overlay.classList.add("is_visible");
  updateGameLoadingProgress();
}

/** Hides the startup loading overlay. */
function hideGameLoading() {
  var overlay = document.getElementById("gameLoadingOverlay");
  if (overlay) overlay.classList.remove("is_visible");
}

/** Preloads the assets needed for the first visible game frame. */
function preloadInitialGameAssets() {
  var requests = INITIAL_GAME_ASSETS.map(function (path) {
    return preloadInitialGameAsset(path);
  });
  return Promise.all(requests);
}

/** Loads and decodes one shared startup image before gameplay begins. */
function preloadInitialGameAsset(path) {
  return preloadRuntimeImage(path).then(function () {
    finishInitialGameAsset();
  });
}

/** Completes one startup asset and refreshes the visible progress. */
function finishInitialGameAsset() {
  initialGameAssetsLoaded++;
  updateGameLoadingProgress();
}

/** Updates the startup loading percentage and progress bar. */
function updateGameLoadingProgress() {
  var total = INITIAL_GAME_ASSETS.length;
  var percent = Math.round(initialGameAssetsLoaded / total * 100);
  var bar = document.getElementById("gameLoadingProgress");
  var label = document.getElementById("gameLoadingPercent");
  if (bar) bar.style.width = percent + "%";
  if (label) label.textContent = percent + "%";
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
    scheduleBossAudioPreload();
  }
  if (typeof bindGlobalCanvasSoundHandler === "function") {
    bindGlobalCanvasSoundHandler();
  }
}

/** Preloads deferred boss audio shortly after gameplay becomes visible. */
function scheduleBossAudioPreload() {
  if (typeof soundHub.prepareBossEffects !== "function") return;
  var timeoutId = setTimeout(function () {
    soundHub.prepareBossEffects();
  }, 1000);
  soundHub.registerTimeout(timeoutId);
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

  __prevHtmlOverflow = document.documentElement.style.overflow;
  __prevBodyOverflow = document.body.style.overflow;

  document.documentElement.style.overflow = "auto";
  document.body.style.overflow = "auto";

  showLegalNotice();
  if (overlay) {
    overlay.style.display = "flex";
  }
}

/** Shows the legal notice and configures the shared legal navigation. */
function showLegalNotice() {
  setLegalFrame("./info.html");
  setLegalSecondaryAction("Privacy Policy", openPrivacyPolicy);
}

/** Shows the privacy policy and configures the shared legal navigation. */
function openPrivacyPolicy() {
  setLegalFrame("./privacy.html");
  setLegalSecondaryAction("Back", showLegalNotice);
}

/** Loads one legal document into the shared iframe. */
function setLegalFrame(source) {
  var frame = document.getElementById("impressumFrame");
  if (frame) frame.src = source;
}

/** Updates the secondary action beside the permanent close button. */
function setLegalSecondaryAction(label, handler) {
  var button = document.getElementById("legalSecondaryButton");
  if (!button) return;
  button.textContent = label;
  button.onclick = handler;
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

/** Closes the audio settings overlay. */
function closeAudioSettings() {
  var overlay = document.getElementById("audioOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

/** Opens the game-control instructions overlay. */
function openGameControl() {
  document.getElementById("gameControlOverlay").style.display = "flex";
}

/** Closes the game-control instructions overlay. */
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
