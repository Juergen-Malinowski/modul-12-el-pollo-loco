
let canvas;                     // Canvas-Element anlegen
let world;                      // Variable für die Welt (World) anlegen
let keyboard = new Keyboard();  // Variablen für Rückmeldung des "keydown" in "keyboard" anlegen



function init() {
    //grundsätzliche Einbindung für canvas und Darstellungsart (2D/3D) ...
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);              // Welt anlegen und Canvas (id canvas) und gedrückte Taste übergeben
    // Charakter-Bild laden ... dauert etwas, weshalb "ctx.drawImage" in eine TIMEOUT-Funktion gepackt wird ...
    // character.src = "../assets/img/2_charakter_pepe/2_walk/W-21.png";
    // setTimeout(function () {   // setzt den TIMEOUT, damit das PNG Zeit zum Laden hat ...
    //     ctx.drawImage(character, 20, 20, 50, 150);
    // }, 1000);
};

window.addEventListener("keydown", (e) => {
    // ACHTUNG:  "keypress" ist veraltet und wird nicht zu 100 % unterstützt (und analysiert nicht alle Tasten !). Deshalb "keydown" !!!
    console.log(e);
    switch (e.key) {
        // EVENT "keydown" auslesen und in einer der Variablen "keyboard" speichern (TRUE)
        case 'ArrowLeft':        // KEY = linker Pfeil / KEYCODE = 37
            keyboard.LEFT = true;
            break;
        case 'ArrowRight':       // KEY = rechter Pfeil / KEYCODE = 39
            keyboard.RIGHT = true;
            break;
        case 'ArrowUp':          // KEY = linker Pfeil / KEYCODE = 38
            keyboard.UP = true;
            break;
        case 'ArrowDown':        // KEY = linker Pfeil / KEYCODE = 40
            keyboard.DOWN = true;
            break;
        case ' ':            // KEY = linker Pfeil / KEYCODE = 32
            keyboard.SPACE = true;
            break;
        case 'Shift':            // KEY = linker Pfeil / KEYCODE = 16
            keyboard.SHIFT = true;
            break;
        case 'Enter':            // KEY = linker Pfeil / KEYCODE = 13
            keyboard.ENTER = true;
            break;
        default:
            break;
    }
});

window.addEventListener("keyup", (e) => {
    // SOBALD eine Taste wieder losgelassen wird, wird die entsprechende Variable von "keyboard" wieder auf FALSE gesetzt !!!
    switch (e.code) {
        case 'ArrowLeft':
            keyboard.LEFT = false;
            break;
        case 'ArrowRight':
            keyboard.RIGHT = false;
            break;
        case 'ArrowUp':
            keyboard.UP = false;
            break;
        case 'ArrowDown':
            keyboard.DOWN = false;
            break;
        case 'Space':
            keyboard.SPACE = false;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            keyboard.SHIFT = false;
            break;
        case 'Enter':
            keyboard.ENTER = false;
            break;
    }
});


