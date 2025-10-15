class World {

    character = new Character();  // Charakter anlegen

    // Feinde anlgen ...
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ];

    // Wolken anlegen ...
    clouds = [
        new Cloud(),
    ];

    // Hintergrundobjekte anlegen ...
    backgroundObjects = [
        new BackgroundObject('../assets/img/5_hintergrund/layers/1_first_layer/1.png'),
    ];


    canvas;       // Canvas-Element anlegen
    ctx;          // Context-Element anlegen (2D/3D)

    constructor(canvas) {
        this.ctx = canvas.getContext("2d");    // im 2D-Format
        this.canvas = canvas;                  // Canvas-Parameter wird der Variable "canvas" (this.canvas) zugewiesen
        this.draw();                           // Welt zeichnen
    }


    // die Welt (World) wird gezeichnet ...
    draw() {
        // Canvas löschen vor dem Neuzeichnen ...
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Charakter NEU zeichnen ...
        this.addToMap(this.character);


        // mit der Schleife alle Feinde (enemies) durchlaufen und zeichnen ...
        // enemy = einzelner Feind (Chicken) bzw. Datensatzelement in enemies-Array
        this.addObjectsToMap(this.enemies);

        // mit der Schleife alle Wolken (clouds) durchlaufen und zeichnen ...
        this.addObjectsToMap(this.clouds);

        // mit der Schleife alle Hintergrundobjekte (backgroundObjects) durchlaufen und zeichnen ...
        this.addObjectsToMap(this.backgroundObjects);


        // Variable "self" anlegen, die auf die Welt (World) zeigt, 
        // da "this" direkt in der requestAnimationFrame-Funktion nicht mehr funktioniert ...
        self = this;
        requestAnimationFrame(function () {
            // wiederholt die draw-Funktion mehrfach pro Sekunde ...
            // (Wiederholungszahl ist von der Grafikkarte des PC abhängig !!!)
            self.draw();
        });
    }


    // forEach-Schleife nur einmal für alle Array-Objekte nutzen ...
    addObjectsToMap(objects) {     // "objects" = Array-Name (z.B. enemies, clouds, backgroundObjects)
        objects.forEach(o => {
            this.addToMap(o);
        });
    }


    // bewegliche Objekte (movableObject) werden der Welt (World) hinzugefügt ( Aufruf durch draw() ) ...
    addToMap(movableObject) {
        this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y,
            movableObject.width, movableObject.heigth);
    }
}
