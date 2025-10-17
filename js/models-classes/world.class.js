class World {

    character = new Character();  // Charakter anlegen
    level = level1;               // "level" übernimmt die Variablen und deren Inhalt aus "level1.js"

    canvas;          // Canvas-Element anlegen
    ctx;             // Context-Element anlegen (2D/3D)
    keyboard;        // Variable keyboard anlegen (Bewegungen Charakter)
    cameraX = 0;     // Variable zur Modifikation der X-Achse für den gezeigten Hintergrundausschnitt

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");    // im 2D-Format
        this.canvas = canvas;                  // Canvas-Parameter wird der Variable "canvas" (this.canvas) zugewiesen
        this.keyboard = keyboard;              // Parameter "keyboard" in Variable "this.keyboard" übernehmen
        this.setWorld();                       // weist dem Character.world die aktuell angelegte Welt mit "this" zu
        this.draw();                           // Welt zeichnen
    }

    setWorld() {
        this.character.world = this;           // "this" ist die aktuell angelegte Welt
    }


    // die Welt (World) wird gezeichnet ...
    draw() {
        // Canvas löschen vor dem Neuzeichnen ...
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Charakter-Spiegelung ?
        this.ctx.translate(this.cameraX, 0);

        // mit der Schleife alle Hintergrundobjekte (backgroundObjects) durchlaufen und zeichnen ...
        this.addObjectsToMap(this.level.backgroundObjects);

        // mit der Schleife alle Wolken (clouds) durchlaufen und zeichnen ...
        this.addObjectsToMap(this.level.clouds);

        // Charakter NEU zeichnen ...
        this.addToMap(this.character);

        // mit der Schleife alle Feinde (enemies) durchlaufen und zeichnen ...
        // enemy = einzelner Feind (Chicken) bzw. Datensatzelement in enemies-Array
        this.addObjectsToMap(this.level.enemies);

        // Charakter-RÜCK-Spiegelung ?
        this.ctx.translate(-this.cameraX, 0);

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
        // WENN "otherDirection" = TRUE ... dann OBJECT spiegeln ...
        if (movableObject.otherDirection) {
            this.ctx.save();                         // aktuelle EINSTELLUNGEN des Kontextes speichern
            this.ctx.translate(movableObject.img.width, 0);
            this.ctx.scale(-1, 1);                   // spiegelt das Object
            movableObject.x = movableObject.x * -1;  // X-Koordinate umkehren            
        }
        // OBJEKT jetzt zeichnen ...
        this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y,
            movableObject.width, movableObject.heigth);
        if (movableObject.otherDirection) {
            movableObject.x = movableObject.x * -1;  // X-Koordinate wieder umkehren            
            this.ctx.restore();            // aktuelle EINSTELLUNGEN des Kontextes wieder laden
        }
    }


    // bewegliche Objekte (movableObject) werden der Welt (World) hinzugefügt ( Aufruf durch draw() ) ...
    addToMap(movableObject) {
        if (movableObject.otherDirection) {
            // WENN "otherDirection" = TRUE ... dann OBJECT spiegeln ...
            this.ctx.save();             // aktuelle EINSTELLUNGEN des Kontextes speichern
            // durch Spiegeln verändert sich die X-Position, weshalb X um die Breite des
            // Bildes korrigiert werden muss vor der Spiegelung ...
            this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
            this.ctx.scale(-1, 1);       // spiegelt das Object
            this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.heigth);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(movableObject.img, movableObject.x, movableObject.y,
                movableObject.width, movableObject.heigth);
        }
    }






}


