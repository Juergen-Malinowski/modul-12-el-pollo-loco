class World {

    character = new Character();  // Charakter anlegen
    level = level1;               // "level" übernimmt die Variablen und deren Inhalt aus "level1.js"
    canvas;          // Canvas-Element anlegen
    ctx;             // Context-Element anlegen (2D/3D)
    keyboard;        // Variable keyboard anlegen (Bewegungen Charakter)
    cameraX = 0;     // Variable zur Modifikation der X-Achse für den gezeigten Hintergrundausschnitt
    statusBar = new StatusBar('health');   // Status-Bar anlegen für Lebenspunkte Charakter
    percentage = 100;              // zu Beginn 100 % Leben ... Hier wird der REST-%-Satz der Lebensenergie abgelegt
    throwableObjects = [];         // Array für Salsa-Flaschen
    collectedBottles = 3;          // Zähler für eingesammelte Flaschen
    score = 0;                     // SCORE-Anzeige für diese Welt
    bottleBar = new StatusBar('bottle');   // Status-Bar anlegen für Flaschen  




    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");    // im 2D-Format
        this.canvas = canvas;                  // Canvas-Parameter wird der Variable "canvas" (this.canvas) zugewiesen
        this.keyboard = keyboard;              // Parameter "keyboard" in Variable "this.keyboard" übernehmen
        this.setWorld();                       // weist dem Character.world die aktuell angelegte Welt mit "this" zu
        this.draw();                           // Welt zeichnen
        this.run();                            // PRÜFUNG, ob eine Kollision (Charakter zu Feinden) erfolgt
        this.score = score;                    // übernehme globalen Score-Startwert in lokale Welt        
        this.updateBottleBar();                // Anzeige Flaschen-Bar aktualisieren 
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

                // Huhn stirbt (Bild wechseln auf totes Huhn)
                enemy.die();

                // SCORE +10 Punkte für das Töten eines Huhns
                this.addScore(10);

                // Optional: Nach 2 Sekunden aus der Welt entfernen
                setTimeout(() => {
                    const index = this.level.enemies.indexOf(enemy);
                    if (index > -1) {
                        this.level.enemies.splice(index, 1);
                    }
                }, 2000);

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
        // === KOLLISION: FLASCHEN (ThrowableObjects) treffen Hühner ===
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];

            // Flasche hat Boden erreicht → wird entfernt (kein "Unendlichrollen")
            if (bottle.y > 380) {
                this.throwableObjects.splice(i, 1);
                continue;
            }

            // Prüfe auf Treffer mit jedem Huhn im Level ...
            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];

                // Wenn das Huhn schon tot ist, überspringen
                if (enemy.isDeadChicken) continue;

                // Einfache Trefferprüfung basierend auf Bounding-Box
                const hit =
                    bottle.x + bottle.width > enemy.x + enemy.offset.left &&
                    bottle.x < enemy.x + enemy.width - enemy.offset.right &&
                    bottle.y + bottle.heigth > enemy.y + enemy.offset.top &&
                    bottle.y < enemy.y + enemy.heigth - enemy.offset.buttom;

                if (hit) {
                    console.log("Huhn von Flasche getroffen an Position X:", enemy.x);

                    // Huhn stirbt ...
                    enemy.die();

                    // +20 Punkte für Treffer Huhn mit Flasche ...
                    this.addScore(20);

                    // Flasche entfernen ...
                    this.throwableObjects.splice(i, 1);

                    // Nach kurzer Zeit totes Huhn aus der Welt entfernen ...
                    setTimeout(() => {
                        const idx = this.level.enemies.indexOf(enemy);
                        if (idx > -1) {
                            this.level.enemies.splice(idx, 1);
                        }
                    }, 2000);
                    break; // keine weiteren Hühner mit derselben Flasche prüfen
                }
            }
        }
    }

    collectBottle(index) {
        // Entfernt die eingesammelte Flasche aus dem Array "bottles"
        this.level.bottles.splice(index, 1);
        console.log("Nach dem Entfernen:", this.level.bottles.length);


        // +1 zum Zähler der gesammelten Flaschen
        this.collectedBottles++;

        // Flaschen-Bar aktualisieren ...
        this.updateBottleBar();

        // +2 Punkte zum SCORE für das Einsammeln einer Bodenflasche
        this.addScore(2);

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

    addScore(points) {
        // Erhöht den globalen und lokalen Score um die übergebene Punktzahl
        this.score += points;
        score = this.score;  // globalen Score synchron halten
        console.log("SCORE +", points, "→ Gesamt:", this.score);

        // Optional: kleiner Text-Effekt beim Sammeln oder Besiegen
        const ctx = this.ctx;
        const x = this.character.x + this.character.width / 2;
        const y = this.character.y - 80;
        let opacity = 1;
        const step = 50;  // ms
        const interval = setInterval(() => {
            ctx.save();
            ctx.font = "bold 25px Zabars";
            ctx.fillStyle = `rgba(255,255,255,${opacity})`;
            ctx.fillText(`+${points} Pts`, x - this.cameraX, y);
            ctx.restore();
            opacity -= 0.2;
            if (opacity <= 0) clearInterval(interval);
        }, step);
    }

    checkThrowObjects() {
        if (this.keyboard.SHIFT && this.collectedBottles > 0) {
            // Charakter darf nur werfen, wenn er Flaschen hat
            this.collectedBottles--;

            // Anzeige Flaschen-Bar aktualisieren ...
            this.updateBottleBar();

            // Wurfposition an Charakter-Blickrichtung anpassen
            const offsetX = this.character.otherDirection ? -30 : 100;
            const throwDirection = this.character.otherDirection ? -1 : 1;

            // Flasche für den Wurf erstellen ...
            let bottle = new ThrowableObjects(
                this.character.x + offsetX,
                this.character.y + 190,
                false,
                throwDirection
            );

            this.throwableObjects.push(bottle);
            this.addScore(1);                       // SCORE +1 Punkt für Wurf

            // Charakter-Wurfanimation zeigen ...
            this.character.playThrowAnimation();

            // Wurf ist ebenfalls eine aktive Spieleraktion → Idle-Zeit zurücksetzen
            this.character.lastActionTime = Date.now();

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
        this.addToMap(this.statusBar);          // Leben-BAR zeichnen
        this.addToMap(this.bottleBar);          // Flaschen-Bar zeichnen

        // ANZEIGE der FLASCHEN-Anzahl (rechts neben der Flaschen-Bar) ...
        this.ctx.font = "bold 32px Zabars";
        this.ctx.fillStyle = "yellow";
        // Position: leicht rechts von der bottleBar (Bar ist 150px breit)
        let bottleTextX = this.bottleBar.x + this.bottleBar.width + 15;   // Position X-Achse (rechts)
        let bottleTextY = this.bottleBar.y + 46;                          // Position Y-Achse (horizontal) festlegen
        this.ctx.fillText(`${this.collectedBottles}`, bottleTextX, bottleTextY);   // ZEICHNEN 


        // === SCORE-Text HUD (fixe Anzeige am oberen Rand) ===
        this.ctx.font = "bold 40px Zabars";
        this.ctx.fillStyle = "yellow";
        this.ctx.fillText(`Score: ${this.score}`, 550, 50);

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

    updateBottleBar() {
        // Flaschenanzahl in Prozent umrechnen (maximal 5 Flaschen)
        let percentage = (this.collectedBottles / 5) * 100;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        this.bottleBar.setPercentage(percentage);
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


