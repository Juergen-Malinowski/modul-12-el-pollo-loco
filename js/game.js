let canvas;              // Canvas-Element anlegen
let world;               // Variable für die Welt (World) anlegen


function init() {
    //grundsätzliche Einbindung für canvas und Darstellungsart (2D/3D) ...
    canvas = document.getElementById("canvas");
    world = new World(canvas);              // Welt anlegen und Canvas (id canvas) übergeben

    console.log("My Charakter is: ", world.character);


    // Charakter-Bild laden ... dauert etwas, weshalb "ctx.drawImage" in eine TIMEOUT-Funktion gepackt wird ...
    // character.src = "../assets/img/2_charakter_pepe/2_walk/W-21.png";
    // setTimeout(function () {   // setzt den TIMEOUT, damit das PNG Zeit zum Laden hat ...
    //     ctx.drawImage(character, 20, 20, 50, 150);
    // }, 1000);
}