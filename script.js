// ===========================================================
//  GLOBALE SOUNDHUB-INSTANZ
//  -------------------------
//  Diese Instanz steht allen Spielklassen (Character, MovableObject,
//  World, usw.) zentral zur Verfügung. Alle Sound-Aufrufe im Spiel
//  nutzen diese eine gemeinsame Instanz.
// ===========================================================

function startGame() {
  // Startbildschirm ausblenden
  var start = document.getElementById("startScreen");
  if (start) {
    start.style.display = "none";
  }

  // Canvas sichtbar machen
  var cvs = document.getElementById("canvas");
  if (cvs) {
    cvs.style.display = "block";
  }

  // === SPIEL STARTEN ===
  // Level-Daten laden und Welt aufbauen
  if (typeof initLevel === "function") {
    initLevel();
  }
  if (typeof init === "function") {
    init();
  }

  // Hintergrundmusik sicher starten (läuft in Schleife)
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

/* ============================================
   HIGHSCORE-OVERLAY (aus Startmenü)
   --------------------------------------------
   Erweiterung:
   - Erkennt den neuesten Highscore (localStorage.newHighscoreEntry)
   - Lässt diesen rot blinken, wenn Overlay geöffnet wird
   ============================================ 
   (C) Jürgen Malinowski – Letzte Bearbeitung: 02.11.2025 – 12:35 Uhr
   ============================================ */
function openHighscore() {
  var overlay = document.getElementById("highscoreOverlay");
  var content = document.getElementById("highscoreContent");

  if (!overlay || !content) {
    return;
  }

  // === Highscore-Daten laden ===
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
      // Absteigend nach Score sortieren
      highScores.sort(function (a, b) {
        return b.score - a.score;
      });

      // === Liste als HTML aufbauen ===
      var listHtml =
        "<ol class='hsList' style='text-align:left; margin:0; padding-left:1.4em;'>";

      for (var i = 0; i < highScores.length; i++) {
        var entry = highScores[i];
        var name = entry && entry.name ? entry.name : "unknown";
        var scoreVal =
          entry && typeof entry.score === "number" ? entry.score : 0;

        // Prüfen, ob dieser Eintrag der neue Highscore ist
        var isHighlighted = false;
        if (
          newEntry &&
          entry.name === newEntry.name &&
          entry.score === newEntry.score
        ) {
          isHighlighted = true;
        }

        if (isHighlighted) {
          // Markiere Zeile für Blink-Effekt (CSS-Klasse)
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

  // Overlay sichtbar machen
  overlay.style.display = "flex";

  // === Blink-Effekt starten, falls neuer Eintrag existiert ===
  var blinkEls = document.getElementsByClassName("blinkHighlight");
  if (blinkEls.length > 0) {
    var visible = true;
    setInterval(function () {
      for (var i = 0; i < blinkEls.length; i++) {
        blinkEls[i].style.color = visible ? "red" : "white";
      }
      visible = !visible;
    }, 500); // alle 0,5 Sekunden wechseln
  }
}

function closeHighscore() {
  var overlay = document.getElementById("highscoreOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

/* ============================================
   IMPRESSUM / THANKS – OVERLAY
   ============================================ */

function openImpressum() {
  var overlay = document.getElementById("impressumOverlay");
  var frame = document.getElementById("impressumFrame");

  if (frame) {
    frame.src = "./info.html";
  }
  if (overlay) {
    overlay.style.display = "flex";
  }
}

function closeImpressum() {
  var overlay = document.getElementById("impressumOverlay");
  var frame = document.getElementById("impressumFrame");
  if (overlay) {
    overlay.style.display = "none";
  }
  if (frame) {
    frame.src = "";
  }
}

/* ============================================
   AUDIO-OVERLAY / -STEUERUNG
   (passt zu soundhub.js mit get/set-Methoden)
   ============================================ */

/**
 * Synchronisiert die Audio-UI (Regler + Button-Beschriftung)
 * mit den aktuellen Werten aus soundHub.
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
 * Öffnet das Audio-Overlay und lädt aktuelle Werte aus soundHub
 */
function openAudioSettings() {
  var overlay = document.getElementById("audioOverlay");
  if (overlay) {
    overlay.style.display = "flex";
  }

  // UI-Werte aus SoundHub einsetzen
  syncAudioUIFromSoundHub();
}

/**
 * Schließt das Audio-Overlay
 */
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
 * Wird vom Musik-Lautstärke-Slider aufgerufen (onchange in index.html)
 * value ist ein String; soundHub kümmert sich um Parsing/Clamping.
 */
function updateMusicVolume(value) {
  if (
    typeof soundHub !== "undefined" &&
    soundHub &&
    typeof soundHub.setMusicVolume === "function"
  ) {
    soundHub.setMusicVolume(value);
  }
  // UI nachführen (z. B. Rundung/Clamping sichtbar machen)
  syncAudioUIFromSoundHub();
}

/**
 * Wird vom Effekt-Lautstärke-Slider aufgerufen (onchange in index.html)
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
 * Globales Stummschalten umschalten (Button im Overlay)
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

/* ============================================
   END-OVERLAY nach dem Speichern des Highscores
   (separates Overlay zusätzlich zum kleinen OK-Hinweis)
   ============================================ */

function showEndHighscoreOverlay() {
  // Overlay-Hintergrund erstellen
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

  // Text: Erfolgsmeldung
  var message = document.createElement("p");
  message.textContent = "🏆 Dein Highscore wurde gespeichert!";
  message.style.fontFamily = "'Zabars', Arial, Helvetica, sans-serif";
  message.style.fontSize = "2em";
  message.style.color = "white";
  message.style.marginBottom = "30px";

  // Button: Zurück zum Start
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

    // Sicherheitshalber Musik stoppen, wenn noch aktiv
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

  // Fokus auf den OK-Button setzen (bessere UX)
  var okBtn = document.getElementById("closeHighscoreSavedButton");
  if (okBtn) {
    okBtn.focus();
  }
}

/**
 * Schließt den kleinen OK-Hinweis (index.html: #highscoreSavedOverlay)
 */
function closeHighscoreSaved() {
  var overlay = document.getElementById("highscoreSavedOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }

  /**
   * Event-Listener: bei Drehung oder Größenänderung automatisch prüfen …
   */
  window.addEventListener("resize", checkOrientation);
  window.addEventListener("orientationchange", checkOrientation);

  /**
   * Prüfung beim ersten Laden ausführen …
   */
  window.addEventListener("load", checkOrientation);
}

/**
 * ===========================================================
 *  ORIENTIERUNGSERKENNUNG (optimiert mit stabilisiertem Resize)
 *  -----------------------------------------------------------
 *  Erkennt Hoch-/Querformat und zeigt das Overlay erst dann,
 *  wenn der Browser die neue Viewportgröße vollständig berechnet hat.
 *  Dadurch kein abgeschnittenes Overlay mehr in Chrome DevTools.
 * ===========================================================
 *  (C) Jürgen Malinowski – Letzte Bearbeitung: 03.11.2025 – 16:00 Uhr
 * ===========================================================
 */
let orientationResizeTimer = null;

function checkOrientation() {
  // Die Anpassung des Fensters für Rotation-Hinweis lässt sich für die
  // DEV-Tools nicht anpassen, damit es bei ersten Auftauchen zentriert ist.
  // Problem tritt bei echten mobilen Devises nicht auf!
  // --- Bei wiederholtem Resize den alten Timer löschen ---
  if (orientationResizeTimer) {
    clearTimeout(orientationResizeTimer);
  }
  // --- Verzögerung, bis Browser die neue Größe stabilisiert hat ---
  orientationResizeTimer = setTimeout(function () {
    var overlay = document.getElementById("orientationOverlay");
    var rotateBtn = document.getElementById("rotateButton");
    var canvas = document.getElementById("canvas");

    console.log(
      "🔍 checkOrientation() triggered (stabilized)...",
      "width:",
      window.innerWidth,
      "height:",
      window.innerHeight,
    );

    if (!overlay || !canvas) {
      return;
    }
    // === Erkennung Portrait oder Landscape ===
    if (window.innerHeight > window.innerWidth) {
      overlay.style.display = "flex";
      canvas.style.display = "none";

      // === Chrome DevTools Fix: Erzwinge zweiten Render-Frame ===
      requestAnimationFrame(() => {
        // minimale Layoutänderung zur Neuberechnung der Breite
        overlay.style.transform = "translateZ(0)";
      });
      // Optional: Button sichtbar machen, wenn unterstützt
      if (
        typeof screen.orientation !== "undefined" &&
        typeof screen.orientation.lock === "function"
      ) {
        rotateBtn.style.display = "inline-block";
      } else {
        rotateBtn.style.display = "none";
      }
    } else {
      overlay.style.display = "none";
      canvas.style.display = "block";
    }
  }, 400); // 400 ms warten, bis Chrome neue Devicegröße stabil übernommen hat
}

/**
 * ===========================================================
 *  ROTATE SCREEN (Fullscreen + Landscape Lock)
 *  -----------------------------------------------------------
 *  Wird aufgerufen, wenn der User auf "Rotate Screen ↻" klickt.
 *  Aktiviert zunächst den Vollbildmodus und versucht anschließend,
 *  das Gerät in Querformat zu drehen. Wenn der Browser dies
 *  blockiert, erscheint ein Hinweisdialog.
 * ===========================================================
 *  (C) Jürgen Malinowski – Letzte Bearbeitung: 03.11.2025 – 14:20 Uhr
 * ===========================================================
 */
function rotateDevice() {
  console.log("🔄 Rotate button clicked – attempting fullscreen + rotation...");

  // Prüfen, ob Fullscreen unterstützt wird
  var elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem
      .requestFullscreen()
      .then(function () {
        console.log("🖥️ Fullscreen mode activated.");

        // Jetzt prüfen, ob Orientation-API verfügbar ist
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

// === Events anhängen ===
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);
window.addEventListener("load", checkOrientation);

function bindGlobalCanvasSoundHandler() {
  var canvas = document.getElementById("canvas");
  if (!canvas) return;

  // ALTEN Handler entfernen (falls vorhanden)
  if (window.__canvasSoundHandler) {
    canvas.removeEventListener("mousedown", window.__canvasSoundHandler);
    window.__canvasSoundHandler = null;
  }

  // NEUEN Handler definieren
  window.__canvasSoundHandler = function (event) {
    if (!window.world) return;

    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;

    if (typeof window.world.handleSoundIconClick === "function") {
      window.world.handleSoundIconClick(x, y);
    }
  };

  // EventListener einbinden
  canvas.addEventListener("mousedown", window.__canvasSoundHandler);
}
