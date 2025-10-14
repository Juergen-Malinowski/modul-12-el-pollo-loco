class World {

    character = new Character();  // Charakter anlegen

    // Feinde anlgen ...
    enemies = [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ];

    canvas;      // Canvas-Element anlegen
    ctx;         // Context-Element anlegen (2D/3D)

    constructor(canvas) {
        this.ctx = canvas.getContext("2d");    // im 2D-Format
        this.canvas = canvas;                  // Canvas-Parameter wird der Variable "canvas" (this.canvas) zugewiesen
        this.draw();                           // Welt zeichnen
    }

    draw() {   // die Welt (World) wird gezeichnet ...
        // Canvas löschen vor dem Neuzeichnen ...
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Charakter NEU zeichnen ...
        this.ctx.drawImage(this.character.img, this.character.x, this.character.y,
            this.character.width, this.character.heigth);

        // mit der Schleife alle Feinde (enemies) durchlaufen und zeichnen ...
        this.enemies.forEach(enemy => {  // enemy = einzelner Feind (Chicken) bzw. Datensatzelement in enemies-Array
            this.ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.heigth);
        });

        // Variable "self" anlegen, die auf die Welt (World) zeigt, 
        // da "this" direkt in der requestAnimationFrame-Funktion nicht mehr funktioniert ...
        self = this;
        requestAnimationFrame(function () {
            // wiederholt die draw-Funktion mehrfach pro Sekunde ...
            // (Wiederholungszahl ist von der Grafikkarte des PC abhängig !!!)
            self.draw();
        });
    }

}
