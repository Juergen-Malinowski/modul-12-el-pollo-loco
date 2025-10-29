function startGame() {
    document.getElementById('startScreen').style.display = 'none';   // Startbildschirm ausblenden
    document.getElementById('canvas').style.display = 'block';       // Canvas sichtbar machen

    // === SPIEL STARTEN ===
    initLevel();   // Level-Daten laden
    init();        // Welt, Charakter, Steuerung etc. aufbauen
    soundHub.playBackgroundMusic();        // Hintergrundmusik starten 
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

function closeHighscoreSaved() {
    // Schließt den Speicherhinweis am Ende des Spiels nach High-Score-Eintrag ...
    var overlay = document.getElementById('highscoreSavedOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}
