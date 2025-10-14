let canvas;
let ctx;
let character = new Character();


function init() {
    //grundsätzliche Einbindung für canvas und Darstellungsart (2D/3D) ...
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");                  // im 2D-Format

    console.log("My Charakter: ", character);
    

    // Charakter-Bild laden ... dauert etwas, weshalb "ctx.drawImage" in eine TIMEOUT-Funktion gepackt wird ...
    // character.src = "../assets/img/2_charakter_pepe/2_walk/W-21.png";
    // setTimeout(function () {   // setzt den TIMEOUT, damit das PNG Zeit zum Laden hat ...
    //     ctx.drawImage(character, 20, 20, 50, 150);
    // }, 1000);
}