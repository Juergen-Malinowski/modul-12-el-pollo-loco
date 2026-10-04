
/**
 * Starts a fresh game world and activates the gameplay UI.
 */
function startGame() {
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

var highscoreBlinkInterval = null;

/**
 * Opens the stored highscore list and highlights the most recent entry.
 */
function openHighscore() {
  stopHighscoreBlink();
  var overlay = document.getElementById("highscoreOverlay");
  var content = document.getElementById("highscoreContent");

  if (!overlay || !content) {
    return;
  }

  var storedData = localStorage.getItem("highScoreTable");
  var newEntry = null;
  try {
    newEntry = JSON.parse(localStorage.getItem("newHighscoreEntry") || "null");
  } catch (e) {
    newEntry = null;
  }

  if (!storedData) {
    content.innerHTML = "<p>No high score available.</p>";
  } else {
    var highScores;
    try {
      highScores = JSON.parse(storedData);
    } catch (e) {
      highScores = [];
    }

    if (!Array.isArray(highScores) || highScores.length === 0) {
      content.innerHTML = "<p>No high score available.</p>";
    } else {
      highScores.sort(function (a, b) {
        return b.score - a.score;
      });

      var listHtml =
        "<ol class='hsList' style='text-align:left; margin:0; padding-left:1.4em;'>";

      for (var i = 0; i < highScores.length; i++) {
        var entry = highScores[i];
        var name = entry && entry.name ? entry.name : "unknown";
        var scoreVal =
          entry && typeof entry.score === "number" ? entry.score : 0;

        var isHighlighted = false;
        if (
          newEntry &&
          entry.name === newEntry.name &&
          entry.score === newEntry.score
        ) {
          isHighlighted = true;
        }

        if (isHighlighted) {
          listHtml +=
            "<li class='blinkHighlight'>" +
            name +
            " — " +
            scoreVal +
            " Points</li>";
        } else {
          listHtml += "<li>" + name + " — " + scoreVal + " Points</li>";
        }
      }

      listHtml += "</ol>";
      content.innerHTML = listHtml;
    }
  }

  overlay.style.display = "flex";

  startHighscoreBlink();
}

/**
 * Starts the visual blink effect for the currently highlighted highscore entry.
 */
function startHighscoreBlink() {
  var blinkEls = document.getElementsByClassName("blinkHighlight");
  if (blinkEls.length === 0) return;

  var visible = true;
  highscoreBlinkInterval = setInterval(function () {
    for (var i = 0; i < blinkEls.length; i++) {
      blinkEls[i].style.color = visible ? "red" : "white";
    }
    visible = !visible;
  }, 500);
}

/**
 * Stops the menu highscore blink interval when the overlay is closed or rebuilt.
 */
function stopHighscoreBlink() {
  if (highscoreBlinkInterval === null) return;

  clearInterval(highscoreBlinkInterval);
  highscoreBlinkInterval = null;
}

function closeHighscore() {
  stopHighscoreBlink();
  var overlay = document.getElementById("highscoreOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
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

function showEndHighscoreOverlay() {
  var overlay = document.createElement("div");
  overlay.id = "endHighscoreOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "40";

  var message = document.createElement("p");
  message.textContent = "🏆 Dein Highscore wurde gespeichert!";
  message.style.fontFamily = "'Zabars', Arial, Helvetica, sans-serif";
  message.style.fontSize = "2em";
  message.style.color = "white";
  message.style.marginBottom = "30px";

  var button = document.createElement("button");
  button.className = "overlayButton";
  button.textContent = "Zurück zum Start";
  button.onclick = function () {
    overlay.remove();

    var cvs = document.getElementById("canvas");
    if (cvs) {
      cvs.style.display = "none";
    }
    var start = document.getElementById("startScreen");
    if (start) {
      start.style.display = "flex";
    }

    if (
      typeof soundHub !== "undefined" &&
      soundHub &&
      typeof soundHub.stopBackgroundMusic === "function"
    ) {
      soundHub.stopBackgroundMusic();
    }
  };

  overlay.appendChild(message);
  overlay.appendChild(button);
  document.body.appendChild(overlay);
}

function showHighscoreSavedOverlay() {
  var overlay = document.getElementById("highscoreSavedOverlay");
  if (overlay) {
    overlay.style.display = "flex";
  }

  var okBtn = document.getElementById("closeHighscoreSavedButton");
  if (okBtn) {
    okBtn.focus();
  }
}

function closeHighscoreSaved() {
  var overlay = document.getElementById("highscoreSavedOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
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

    console.log(
      "🔍 checkOrientation() triggered (stabilized)...",
      "width:",
      window.innerWidth,
      "height:",
      window.innerHeight,
    );

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
  console.log("🔄 Rotate button clicked – attempting fullscreen + rotation...");

  var elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem
      .requestFullscreen()
      .then(function () {
        console.log("🖥️ Fullscreen mode activated.");

        if (
          typeof screen.orientation !== "undefined" &&
          typeof screen.orientation.lock === "function"
        ) {
          screen.orientation
            .lock("landscape")
            .then(function () {
              console.log("✅ Device successfully rotated to landscape mode.");
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

    if (typeof window.world.handleSoundIconClick === "function") {
      window.world.handleSoundIconClick(x, y);
    }
  };

  canvas.addEventListener("mousedown", window.__canvasSoundHandler);
}

/**
 * Opens the player-name dialog for a qualifying highscore.
 * @param {number} score - Score to store after confirmation.
 */
function openHighscoreNameDialog(score) {
  if (document.getElementById("highscoreNameOverlay")) return;

  var overlay = document.createElement("div");
  overlay.id = "highscoreNameOverlay";
  overlay.innerHTML = `
    <div id="highscoreNameBox">
      <h2>🏆 New Highscore!</h2>
      <p>Your score: <strong>${score}</strong></p>

      <input
        id="highscoreNameInput"
        type="text"
        maxlength="16"
        placeholder="Your name"
      />

      <div id="highscoreNameActions">
        <button class="menuButton" onclick="submitHighscoreName(${score})">
          Save
        </button>
        <button class="menuButton" onclick="closeHighscoreNameDialog()">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    var input = document.getElementById("highscoreNameInput");
    if (input) input.focus();
  }, 50);
}

/**
 * Validates the entered player name and stores the highscore.
 * @param {number} score - Score associated with the entered name.
 */
function submitHighscoreName(score) {
  var input = document.getElementById("highscoreNameInput");
  if (!input) return;

  var name = input.value.trim();
  if (!name) {
    input.focus();
    return;
  }

  storeHighscore(name, score);
  closeHighscoreNameDialog();
}

/**
 * Stores a highscore entry and keeps only the ten highest scores.
 * @param {string} name - Player name.
 * @param {number} score - Player score.
 */
function storeHighscore(name, score) {
  var list = [];
  try {
    list = JSON.parse(localStorage.getItem("highScoreTable") || "[]");
  } catch (e) {
    list = [];
  }

  list.push({ name: name, score: score });

  list.sort(function (a, b) {
    return b.score - a.score;
  });

  if (list.length > 10) {
    list = list.slice(0, 10);
  }

  localStorage.setItem("highScoreTable", JSON.stringify(list));
  localStorage.setItem(
    "newHighscoreEntry",
    JSON.stringify({ name: name, score: score }),
  );

  if (typeof showHighscoreSavedOverlay === "function") {
    showHighscoreSavedOverlay();
  }
}

function closeHighscoreNameDialog() {
  var overlay = document.getElementById("highscoreNameOverlay");
  if (overlay) {
    overlay.remove();
  }
}
