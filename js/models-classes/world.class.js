class World {

    character = new Character();  // Charakter anlegen
    level = level1;               // "level" übernimmt die Variablen und deren Inhalt aus "level1.js"
    canvas;          // Canvas-Element anlegen
    ctx;             // Context-Element anlegen (2D/3D)
    keyboard;        // Variable keyboard anlegen (Bewegungen Charakter)
    cameraX = 0;     // Variable zur Modifikation der X-Achse für den gezeigten Hintergrundausschnitt
    statusBar = new StatusBar();   // Statusbar anlegen
    percentage = 100;              // zu Beginn 100 % Leben ... Hier wird der REST-%-Satz der Lebensenergie abgelegt
    throwableObjects = [];         // Array für Salsa-Flaschen
    collectedBottles = 3;          // Zähler für eingesammelte Flaschen



    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");    // im 2D-Format
        this.canvas = canvas;                  // Canvas-Parameter wird der Variable "canvas" (this.canvas) zugewiesen
        this.keyboard = keyboard;              // Parameter "keyboard" in Variable "this.keyboard" übernehmen
        this.setWorld();                       // weist dem Character.world die aktuell angelegte Welt mit "this" zu
        this.draw();                           // Welt zeichnen
        this.run();                            // PRÜFUNG, ob eine Kollision (Charakter zu Feinden) erfolgt
    }

    setWorld() {
        this.character.world = this;           // "this" ist die aktuell angelegte Welt
    }


    run() {
        // In der World global laufender Zeitintervall ...
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, 50);
    }

    checkCollisions() {
    // COLLISION zwischen Charakter und Feinden prüfen ...
    // PRÜFE JEDEN Gegener aus Level 1 ...
    for (let i = this.level.enemies.length - 1; i >= 0; i--) {
        const enemy = this.level.enemies[i];

        // Keine Kollision = keine weitere Prüfung ...
        if (!this.character.isColliding(enemy)) {
            continue;
        }

        // Prüfen, ob der Charakter von OBEN auf das Huhn springt ...
        const faelltNachUnten = this.character.speedY < 0; // positiv = hoch, negativ = fallend
        const charBottom = this.character.y + this.character.heigth - (this.character.offset ? this.character.offset.buttom : 0);
        const enemyTop = enemy.y + (enemy.offset ? enemy.offset.top : 0);
        const oberhalb = charBottom <= (enemy.y + enemy.heigth * 0.5); // großzügig: obere Hälfte

        if (faelltNachUnten && oberhalb && !enemy.isDeadChicken) {
            // Huhn bekommt Schaden / stirbt
            console.log("Huhn wurde von oben getroffen an Position X:", enemy.x);

            // „Abprallen“ nach oben + Aufsetz-Korrektur, damit keine Folgekollision entsteht
            this.character.speedY = 25;
            this.character.y = enemyTop - this.character.heigth;

            // Huhn stirbt ... Bild wechseln auf totes Huhn ...
            enemy.die();

            // ENTFERNT totes HUHN nach 5 Sekunden aus der Welt entfernen ...
            setTimeout(() => {
                const index = this.level.enemies.indexOf(enemy);
                if (index > -1) {
                    this.level.enemies.splice(index, 1);
                }
            }, 5000);

            continue; // Wichtig: KEIN Schaden am Charakter in diesem Tick
        }

        // Normale Kollision (seitlich / von vorn) → Charakter nimmt Schaden
        // Nur, wenn das Huhn lebt (nicht tot)
        if (!enemy.isDeadChicken) {
            this.character.wasHit();       // ENERGIE abziehen pro Zeiteinheit ms und Schaden verarbeiten

            // "percentage" liegt immer zwischen 0 und 100, da Statusbar "getImageIndex()" die Bilder
            // mit einem Wert zwischen 0 und 100 zuordnet ...
            this.percentage = this.character.energie / this.character.holeEnergie * 100;

            this.statusBar.setPercentage(this.percentage);
            // console.log("ENERGIEABZUG Berührung .... REST-Energie", this.character.energie);
        }
    }

    // COLLISION zwischen Charakter und BODEN-FLASCHEN prüfen ...
    for (let i = this.level.bottles.length - 1; i >= 0; i--) {
        const bottle = this.level.bottles[i];
        if (this.character.isColliding(bottle)) {
            console.log("Flasche eingesammelt bei Position X:", bottle.x);
            this.collectBottle(i);
        }
    }
}


    // checkCollisions() {
    //     // COLLISION zwischen Charakter und Feinden prüfen ...
    //     // PRÜFE JEDEN Gegener aus Level 1 ...
    //     this.level.enemies.forEach((enemy, index) => {
    //         if (!this.character.isColliding(enemy)){
    //             console.log('KEINE Kollision ... ABBRAUCH checkCollisions');
                
    //             return;
    //         };
    //         console.log('KEINE ABBRAUCH, da KOLLISION erfolgte ...###################');
            
    //         // Prüfen, ob der Charakter von OBEN auf das Huhn springt
    //         const faelltNachUnten = this.character.speedY < 0; // positiv = hoch, negativ = fallend
    //         const charBottom = this.character.y + this.character.heigth - (this.character.offset ? this.character.offset.buttom : 0);
    //         const enemyTop = enemy.y + (enemy.offset ? enemy.offset.top : 0);
    //         const oberhalb = charBottom <= (enemy.y + enemy.heigth * 0.5); // großzügig: obere Hälfte

    //         if (faelltNachUnten && oberhalb) {
    //             // Huhn bekommt Schaden / stirbt
    //             if (typeof enemy.wasHit === 'function') enemy.wasHit();
    //             console.log("Huhn wurde von oben getroffen an Position X:", enemy.x);

    //             // Optional: Sofort entfernen, wenn tot
    //             if (typeof enemy.isDead === 'function' && enemy.isDead()) {
    //                 console.log("Huhn besiegt an Position X:", enemy.x);
    //                 this.level.enemies.splice(index, 1);
    //             }

    //             // „Abprallen“ nach oben + Aufsetz-Korrektur, damit keine Folgekollision entsteht
    //             this.character.speedY = 25;
    //             this.character.y = enemyTop - this.character.heigth;
    //             return; // Wichtig: KEIN Schaden am Charakter in diesem Tick
    //         }

    //         // normale Kollision (seitlich / von vorn) → Charakter nimmt Schaden
    //         this.character.wasHit();       // ENERGIE abziehen pro Zeiteinheit ms und Schaden verarbeiten

    //         // "percentage" liegt immer zwischen 0 und 100, da Statusbar "getImageIndex()" die Bilder
    //         // mit einem Wert zwischen 0 und 100 zuordnet ...
    //         this.percentage = this.character.energie / this.character.holeEnergie * 100;

    //         this.statusBar.setPercentage(this.percentage);
    //         // console.log("ENERGIEABZUG Berührung .... REST-Energie", this.character.energie);
    //     });

    //     // COLLISION zwischen Charakter und BODEN-FLASCHEN prüfen ...
    //     this.level.bottles.forEach((bottle, index) => {
    //         if (this.character.isColliding(bottle)) {
    //             console.log("Flasche eingesammelt bei Position X:", bottle.x);
    //             this.collectBottle(index);
    //         }
    //     });
    // }



    // checkCollisions() {
    //     // COLLISION zwischen Charakter und Feinden prüfen ...
    //     // PRÜFE JEDEN Gegener aus Level 1 ...
    //     this.level.enemies.forEach((enemy) => {
    //         if (this.character.isColliding(enemy)) {
    //             this.character.wasHit();       // ENERGIE abziehen pro Zeiteinheit ms und Schaden verarbeiten
    //             // "percentage" liegt immer zwischen 0 und 100, da Statusbar "getImageIndex()" die Bilder
    //             // mit einem Wert zwischen 0 und 100 zuordnet ...
    //             this.percentage = this.character.energie / this.character.holeEnergie * 100;
    //             this.statusBar.setPercentage(this.percentage);
    //             console.log("ENERGIEABZUG Berührung .... REST-Energie", this.character.energie);
    //         };
    //     });

    //     // COLLISION zwischen Charakter und BODEN-FLASCHEN prüfen ...
    //     this.level.bottles.forEach((bottle, index) => {
    //         if (this.character.isColliding(bottle)) {
    //             console.log("Flasche eingesammelt bei Position X:", bottle.x);
    //             this.collectBottle(index);
    //         }
    //     });
    // }

    collectBottle(index) {
        // Entfernt die eingesammelte Flasche aus dem Array "bottles"
        this.level.bottles.splice(index, 1);
        console.log("Nach dem Entfernen:", this.level.bottles.length);


        // +1 zum Zähler der gesammelten Flaschen
        this.collectedBottles++;

        // Optional: kurze optische Rückmeldung
        this.showBottlePickupEffect();

        // Optional: Sound oder Animation für das Einsammeln
        // let bottlePickupSound = new Audio('assets/sound/bottle-pickup.mp3');
        // bottlePickupSound.play();

        console.log("Flaschen gesammelt:", this.collectedBottles);
    }

    showBottlePickupEffect() {
        // Effekt für das Einsammeln von Flaschen anzeigen ...
        // Position des Effekts über dem Charakter
        const x = this.character.x + this.character.width / 2;
        const y = this.character.y - 50;
        // Temporäres Canvas-Text-Overlay
        const ctx = this.ctx;
        const effectDuration = 500; // ms
        let opacity = 1;
        const step = 50; // ms
        const interval = setInterval(() => {
            ctx.save();
            ctx.font = "bold 30px Zabars";
            ctx.fillStyle = `rgba(255,255,0,${opacity})`;
            ctx.fillText("+1", x - this.cameraX, y);
            ctx.restore();
            opacity -= 0.2;
            if (opacity <= 0) clearInterval(interval);
        }, step);
    }



    checkThrowObjects() {
        if (this.keyboard.SHIFT) {
            // NEUE SALSA-Flasche an der Position des Charakters erstellen ...   
            let bottle = new ThrowableObjects(this.character.x, this.character.y + 190);
            this.throwableObjects.push(bottle);
        }
    }


    // die Welt (World) wird gezeichnet ...
    draw() {
        // Canvas löschen vor dem Neuzeichnen ...
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Bildausschnitt verschieben ... PLUS
        this.ctx.translate(this.cameraX, 0);

        // mit der Schleife alle Hintergrundobjekte (backgroundObjects) durchlaufen und zeichnen ...
        this.addObjectsToMap(this.level.backgroundObjects);


        // Statusbar zeichnen ... bzw. HIER am Bildschirm fixierte Objekte zeichnen !!!
        this.ctx.translate(-this.cameraX, 0);   // Bildausschnitt zurücksetzen
        this.addToMap(this.statusBar);          // Statusbar an FIXEN-Punkt im canvas zeichnen
        this.ctx.translate(this.cameraX, 0);    // Bildausschnitt wieder anpassen

        // mit der Schleife alle Wolken (clouds) durchlaufen und zeichnen ...
        this.addObjectsToMap(this.level.clouds);

        // mit der Schleife alle Flaschen (bottles) zeichnen ...
        this.addObjectsToMap(this.level.bottles);

        // Charakter NEU zeichnen ...
        this.addToMap(this.character);

        // mit der Schleife alle Feinde (enemies) durchlaufen und zeichnen ...
        // enemy = einzelner Feind (Chicken) bzw. Datensatzelement in enemies-Array
        this.addObjectsToMap(this.level.enemies);

        // Salsa-Flaschen zeichnen ...
        this.addObjectsToMap(this.throwableObjects);

        // Bildausschnitt verschieben ... MINUS
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
        if (movableObject.otherDirection) {
            // WENN "otherDirection" = TRUE ... dann OBJECT spiegeln ...
            this.flipImage(movableObject);        // RICHTUNG wird auf RECHTS umgestellt für Charakter
            movableObject.drawFrame(this.ctx);    // Collisions-Rahmen zeichnen
        } else {
            // WENN "otherDirection" = FALSE ... dann OBJECT NICHT spiegeln ...
            movableObject.draw(this.ctx);
            movableObject.drawFrame(this.ctx);    // Collisions-Rahmen zeichnen
        }
        // Quadrat um Objekte ziehen ...

    }

    flipImage(movableObject) {
        this.ctx.save();             // aktuelle EINSTELLUNGEN des Kontextes speichern
        // durch Spiegeln verändert sich die X-Position, weshalb X um die Breite des
        // Bildes korrigiert werden muss vor der Spiegelung ...
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);       // spiegelt das Object
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.heigth);
        this.ctx.restore();          // gespeicherte EINSTELLUNGEN des Kontextes wieder laden
    }
}


