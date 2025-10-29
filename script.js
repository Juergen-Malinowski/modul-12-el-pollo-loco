function startGame() {
    // Startbildschirm ausblenden
    document.getElementById('startScreen').style.display = 'none';

    // Canvas sichtbar machen
    document.getElementById('canvas').style.display = 'block';

    // === SPIEL STARTEN ===
    initLevel();   // Level-Daten laden
    init();        // Welt, Charakter, Steuerung etc. aufbauen
}

function openHighscore() {
    // Overlay- und Content-Elemente holen ...
    var overlay = document.getElementById("highscoreOverlay");
    var content = document.getElementById("highscoreContent");

    // Inhalt zunächst leeren ...
    content.innerHTML = "";

    // Highscore-Daten aus dem localStorage holen ...
    var storedData = localStorage.getItem("highScoreTable");
    if (!storedData) {
        // Keine Daten vorhanden ...
        content.innerHTML = "<p>Keine Highscores vorhanden.</p>";
    } else {
        // Daten parsen und Liste aufbauen ...
        var highScores;
        try {
            highScores = JSON.parse(storedData);
        } catch (e) {
            highScores = [];
        }

        if (!Array.isArray(highScores) || highScores.length === 0) {
            content.innerHTML = "<p>Keine Highscores vorhanden.</p>";
        } else {
            // Sortierung (falls nötig) und Ausgabe im Stil der Spiellogik ...
            highScores.sort(function (a, b) {
                return b.score - a.score;
            });

            var listHtml = "<ol class='hsList' style='text-align:left; margin:0; padding-left:1.4em;'>";
            for (var i = 0; i < highScores.length; i++) {
                var entry = highScores[i];

                // Fallbacks sauber halten
                var name = entry && entry.name ? entry.name : "Unbekannt";
                var scoreVal = entry && typeof entry.score === "number" ? entry.score : 0;

                // KEINE manuelle Rangnummer mehr voranstellen!
                listHtml += "<li>" + name + " — " + scoreVal + " Punkte</li>";
            }
            listHtml += "</ol>";
            content.innerHTML = listHtml;
        }

        // Overlay sichtbar machen (Flex-Ausrichtung greift jetzt) ...
        overlay.style.display = "flex";
    }
}

function closeHighscore() {
    // Overlay wieder ausblenden ...
    var overlay = document.getElementById("highscoreOverlay");
    overlay.style.display = "none";
}

function openImpressum() {
    // Overlay und Frame-Element holen ...
    var overlay = document.getElementById("impressumOverlay");
    var frame = document.getElementById("impressumFrame");

    // Inhalt (HTML-Datei) laden ...
    frame.src = "./info.html";

    // Overlay sichtbar machen ...
    overlay.style.display = "flex";
}

function closeImpressum() {
    // Overlay ausblenden und Frame leeren ...
    var overlay = document.getElementById("impressumOverlay");
    var frame = document.getElementById("impressumFrame");
    overlay.style.display = "none";
    frame.src = "";
}
function openAudioSettings() {
    var overlay = document.getElementById("audioOverlay");
    overlay.style.display = "flex";
}

function closeAudioSettings() {
    var overlay = document.getElementById("audioOverlay");
    overlay.style.display = "none";
}

function updateMusicVolume(value) {
    soundHub.backgroundMusic.volume = parseFloat(value);
}

function updateEffectVolume(value) {
    var vol = parseFloat(value);
    soundHub.soundJump.volume = vol;
    soundHub.soundCoin.volume = vol;
    soundHub.soundHit.volume = vol;
    soundHub.soundThrow.volume = vol;
}

function toggleMuteAll() {
    soundHub.toggleMute();
}

function showEndHighscoreOverlay() {
    // === Overlay-Hintergrund erstellen ===
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

    // === Text: Erfolgsmeldung ===
    var message = document.createElement("p");
    message.textContent = "🏆 Dein Highscore wurde gespeichert!";
    message.style.fontFamily = "'Zabars', Arial, Helvetica, sans-serif";
    message.style.fontSize = "2em";
    message.style.color = "white";
    message.style.marginBottom = "30px";

    // === Button: Zurück zum Start ===
    var button = document.createElement("button");
    button.className = "overlayButton";  // nutzt deinen einheitlichen Stil
    button.textContent = "Zurück zum Start";
    button.onclick = function () {
        overlay.remove();
        document.getElementById("canvas").style.display = "none";
        document.getElementById("startScreen").style.display = "flex";
    };

    overlay.appendChild(message);
    overlay.appendChild(button);
    document.body.appendChild(overlay);
}
