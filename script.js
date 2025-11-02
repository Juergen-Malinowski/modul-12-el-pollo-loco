// ===========================================================
//  GLOBALE SOUNDHUB-INSTANZ
//  -------------------------
//  Diese Instanz steht allen Spielklassen (Character, MovableObject,
//  World, usw.) zentral zur Verfügung. Alle Sound-Aufrufe im Spiel
//  nutzen diese eine gemeinsame Instanz.
// ===========================================================
var soundHub = new SoundHub();

function startGame() {
    // Startbildschirm ausblenden
    var start = document.getElementById('startScreen');
    if (start) {
        start.style.display = 'none';
    }

    // Canvas sichtbar machen
    var cvs = document.getElementById('canvas');
    if (cvs) {
        cvs.style.display = 'block';
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
    if (typeof soundHub !== "undefined" && soundHub && typeof soundHub.playBackgroundMusic === "function") {
        soundHub.playBackgroundMusic();
    }
}


/* ============================================
   HIGHSCORE-OVERLAY (aus Startmenü)
   ============================================ */

function openHighscore() {
    var overlay = document.getElementById("highscoreOverlay");
    var content = document.getElementById("highscoreContent");

    if (!overlay || !content) {
        return;
    }

    // Inhalt zunächst leeren
    content.innerHTML = "";

    // Highscore-Daten aus dem localStorage holen
    var storedData = localStorage.getItem("highScoreTable");
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

            // Geordnete Liste – Nummerierung übernimmt <ol>
            var listHtml = "<ol class='hsList' style='text-align:left; margin:0; padding-left:1.4em;'>";
            for (var i = 0; i < highScores.length; i++) {
                var entry = highScores[i];
                var name = entry && entry.name ? entry.name : "unknown";
                var scoreVal = entry && typeof entry.score === "number" ? entry.score : 0;
                listHtml += "<li>" + name + " — " + scoreVal + " Points</li>";
            }
            listHtml += "</ol>";
            content.innerHTML = listHtml;
        }
    }

    // Overlay sichtbar machen
    overlay.style.display = "flex";
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
    document.getElementById('gameControlOverlay').style.display = 'flex';
}

function closeGameControl() {
    document.getElementById('gameControlOverlay').style.display = 'none';
}


/**
 * Wird vom Musik-Lautstärke-Slider aufgerufen (onchange in index.html)
 * value ist ein String; soundHub kümmert sich um Parsing/Clamping.
 */
function updateMusicVolume(value) {
    if (typeof soundHub !== "undefined" && soundHub && typeof soundHub.setMusicVolume === "function") {
        soundHub.setMusicVolume(value);
    }
    // UI nachführen (z. B. Rundung/Clamping sichtbar machen)
    syncAudioUIFromSoundHub();
}

/**
 * Wird vom Effekt-Lautstärke-Slider aufgerufen (onchange in index.html)
 */
function updateEffectVolume(value) {
    if (typeof soundHub !== "undefined" && soundHub && typeof soundHub.setEffectsVolume === "function") {
        soundHub.setEffectsVolume(value);
    }
    syncAudioUIFromSoundHub();
}

/**
 * Globales Stummschalten umschalten (Button im Overlay)
 */
function toggleMuteAll() {
    if (typeof soundHub !== "undefined" && soundHub && typeof soundHub.toggleMute === "function") {
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
        if (typeof soundHub !== "undefined" && soundHub && typeof soundHub.stopBackgroundMusic === "function") {
            soundHub.stopBackgroundMusic();
        }
    };

    overlay.appendChild(message);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
}

function showHighscoreSavedOverlay() {
    var overlay = document.getElementById('highscoreSavedOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }

    // Fokus auf den OK-Button setzen (bessere UX)
    var okBtn = document.getElementById('closeHighscoreSavedButton');
    if (okBtn) {
        okBtn.focus();
    }
}



/**
 * Schließt den kleinen OK-Hinweis (index.html: #highscoreSavedOverlay)
 */
function closeHighscoreSaved() {
    var overlay = document.getElementById('highscoreSavedOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
