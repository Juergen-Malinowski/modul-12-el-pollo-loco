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
    alert("Highscore-Anzeige wird später ergänzt.");
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

            var listHtml = "<ol style='text-align:left; margin:0; padding-left:1.4em;'>";
            for (var i = 0; i < highScores.length; i++) {
                var entry = highScores[i];
                var rank = (i + 1).toString().padStart(2, "0");
                var name = entry && entry.name ? entry.name : "Unbekannt";
                var score = entry && typeof entry.score === "number" ? entry.score : 0;
                listHtml += "<li>" + rank + ". " + name + " — " + score + " Punkte</li>";
            }
            listHtml += "</ol>";
            content.innerHTML = listHtml;
        }
    }

    // Overlay sichtbar machen (Flex-Ausrichtung greift jetzt) ...
    overlay.style.display = "flex";
}

function closeHighscore() {
    // Overlay wieder ausblenden ...
    var overlay = document.getElementById("highscoreOverlay");
    overlay.style.display = "none";
}


