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

