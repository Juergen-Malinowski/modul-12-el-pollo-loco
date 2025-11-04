let canvas;                        // Canvas-Element anlegen
let world;                         // Variable für die Welt (World) anlegen
let keyboard = new Keyboard();     // Variablen für Rückmeldung des "keydown" in "keyboard" anlegen
let score = 0;                     // Globale SCORE-Zählvariable für Spielpunkte





// ##################################
// Nur für TEST, später löschen
// ##################################
if (typeof soundHub === 'undefined' && typeof window !== 'undefined' && window.soundHub) {
    var soundHub = window.soundHub;
}
console.log("SoundHub verfügbar?", typeof soundHub);





function init() {
    // grundsätzliche Einbindung für canvas und Darstellungsart (2D/3D) ...
    canvas = document.getElementById("canvas");
    initLevel();        // jetzt wird Welt erschaffen
    world = new World(canvas, keyboard);              // Welt anlegen und Canvas (id canvas) und gedrückte Taste übergeben
};

window.addEventListener("keydown", (e) => {
    // ACHTUNG:  "keypress" ist veraltet und wird nicht zu 100 % unterstützt (und analysiert nicht alle Tasten !). Deshalb "keydown" !!!
    switch (e.key) {
        // EVENT "keydown" auslesen und in einer der Variablen "keyboard" speichern (TRUE) ...
        case 'ArrowLeft':        // KEY = linker Pfeil / KEYCODE = 37
            keyboard.LEFT = true; break;
        case 'ArrowRight':       // KEY = rechter Pfeil / KEYCODE = 39
            keyboard.RIGHT = true; break;
        case 'ArrowUp':          // KEY = linker Pfeil / KEYCODE = 38
            keyboard.UP = true; break;
        case 'ArrowDown':        // KEY = linker Pfeil / KEYCODE = 40
            keyboard.DOWN = true; break;
        case ' ':            // KEY = linker Pfeil / KEYCODE = 32
            keyboard.SPACE = true; break;
        case 'Shift':            // KEY = linker Pfeil / KEYCODE = 16
            keyboard.SHIFT = true; break;
        case 'Enter':            // KEY = linker Pfeil / KEYCODE = 13
            keyboard.ENTER = true; break;
        default: break;
    }
});

window.addEventListener("keyup", (e) => {
    // SOBALD eine Taste wieder losgelassen wird, wird die entsprechende Variable von "keyboard" wieder auf FALSE gesetzt ...
    switch (e.code) {
        case 'ArrowLeft':
            keyboard.LEFT = false; break;
        case 'ArrowRight':
            keyboard.RIGHT = false; break;
        case 'ArrowUp':
            keyboard.UP = false; break;
        case 'ArrowDown':
            keyboard.DOWN = false; break;
        case 'Space':
            keyboard.SPACE = false; break;
        case 'ShiftLeft':
        case 'ShiftRight':
            keyboard.SHIFT = false; break;
        case 'Enter':
            keyboard.ENTER = false; break;
    }
});


