class World {

    character = new Character();           // Charakter anlegen
    level = level1;                        // Level-Objekt laden
    canvas;                                // Canvas-Element
    ctx;                                   // Canvas-Kontext
    keyboard;                              // Steuerung
    cameraX = 0;                           // Kamera-Verschiebung
    statusBar = new StatusBar('health');   // Lebensanzeige
    bottleBar = new StatusBar('bottle');   // Flaschenanzeige
    coinBar = new StatusBar('coins');      // Münz-Anzeige
    bossBar = new StatusBar('endboss');    // Lebensanzeige Endboss
    percentage = 100;                      // Lebens-Energie in %
    throwableObjects = [];                 // geworfene Flaschen
    collectedBottles = 3;                  // gesammelte Flaschen
    score = 0;                             // Punkte
    youWinImg = new Image();               // Bildobjekt für "You Win"
    showYouWin = false;                    // Steuerung, ob das Bild angezeigt wird

    // Variablen für Sarg-Animation ...
    coffinRotation = 0;
    showCoffin = false;
    coffinImg = new Image();
    coffinSpin = null;


    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.coffinImg.src = 'assets/img/2_charakter_pepe/5_dead/coffin.png'; // Sarg-Bild laden
        this.youWinImg.src = 'assets/img/0_you_won_you_lost/You Win A.png';   // You-Win-Bild laden
        this.setWorld();
        this.draw();
        this.run();
        this.score = score;
        this.updateBottleBar();
    }

    setWorld() {
        this.character.world = this;  // Charakter kennt die Welt
        // Jeder Gegner im Level bekommt die Referenz auf die Welt ...
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
        });
    }


    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
        }, 50);
    }

    checkCollisions() {
        // keine Kollisionsprüfung mehr, wenn das Spiel beendet ist ...
        if (this.gameOver) {
            return;
        }

        // CHARAKTER KOLLISION mit FEINDEN ...
        for (let i = this.level.enemies.length - 1; i >= 0; i--) {
            const enemy = this.level.enemies[i];

            if (!this.character.isColliding(enemy)) continue;

            const faelltNachUnten = this.character.speedY < 0;
            const charBottom = this.character.y + this.character.heigth - (this.character.offset ? this.character.offset.buttom : 0);
            const enemyTop = enemy.y + (enemy.offset ? enemy.offset.top : 0);
            const oberhalb = charBottom <= (enemy.y + enemy.heigth * 0.5);

            if (faelltNachUnten && oberhalb && !enemy.isDeadChicken) {
                this.character.speedY = 25;
                this.character.y = enemyTop - this.character.heigth;
                enemy.die();
                this.addScore(10);
                setTimeout(() => {
                    const index = this.level.enemies.indexOf(enemy);
                    if (index > -1) this.level.enemies.splice(index, 1);
                }, 2000);
                continue;
            }

            if (!enemy.isDeadChicken) {
                this.character.wasHit();
                this.percentage = this.character.energie / this.character.holeEnergie * 100;
                this.statusBar.setPercentage(this.percentage);
            }
        }

        // KOLLISION CHARAKTER mit BODEN-FLASCHEN ...
        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            const bottle = this.level.bottles[i];
            if (this.character.isColliding(bottle)) {
                this.collectBottle(i);
            }
        }

        // KOLLISION geworfene FLASCHEN mit normalen HÜHNERN ...
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];

            if (bottle.y > 380) {
                this.throwableObjects.splice(i, 1);
                continue;
            }

            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];

                // Endboss in dieser Schleife NICHT behandeln ...
                if (enemy instanceof Endboss) {
                    continue;
                }

                if (enemy.isDeadChicken) {
                    continue;
                }

                const hit =
                    bottle.x + bottle.width > enemy.x + enemy.offset.left &&
                    bottle.x < enemy.x + enemy.width - enemy.offset.right &&
                    bottle.y + bottle.heigth > enemy.y + enemy.offset.top &&
                    bottle.y < enemy.y + enemy.heigth - enemy.offset.buttom;

                if (hit) {
                    enemy.die();
                    this.addScore(20);
                    this.throwableObjects.splice(i, 1);
                    setTimeout(() => {
                        const idx = this.level.enemies.indexOf(enemy);
                        if (idx > -1) this.level.enemies.splice(idx, 1);
                    }, 2000);
                    break;
                }
            }
        }


        //KOLLISION geworfene FLASCHEN mit ENDBOSS ...
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];
            const boss = this.level.enemies.find(function (e) { return e instanceof Endboss; });
            if (!boss || boss.isDeadBoss) {
                continue;
            }

            const hit =
                bottle.x + bottle.width > boss.x + boss.offset.left &&
                bottle.x < boss.x + boss.width - boss.offset.right &&
                bottle.y + bottle.heigth > boss.y + boss.offset.top &&
                bottle.y < boss.y + boss.heigth - boss.offset.buttom;

            if (hit) {
                // Flasche zuerst entfernen, um Mehrfach-Treffer zu verhindern ...
                this.throwableObjects.splice(i, 1);
                // Treffer einmalig registrieren (Cooldown schützt zusätzlich) ...
                boss.wasHit();
                break; // Schleife abbrechen – nur ein Treffer pro Flasche zulassen
            }
        }
    }

    collectBottle(index) {
        // FLASCHEN aufsammeln ...
        this.level.bottles.splice(index, 1);
        this.collectedBottles++;
        this.updateBottleBar();
        this.addScore(2);
        this.showBottlePickupEffect();
    }

    showBottlePickupEffect() {
        // Zeige Flaschen-Aufheben-Effekt ...
        const x = this.character.x + this.character.width / 2;
        const y = this.character.y - 50;
        const ctx = this.ctx;
        let opacity = 1;
        const step = 50;
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
        // SCORE-Points geben ...
        this.score += points;
        score = this.score;
        const ctx = this.ctx;
        const x = this.character.x + this.character.width / 2;
        const y = this.character.y - 80;
        let opacity = 1;
        const step = 50;
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

    // Flaschen werfen ...
    checkThrowObjects() {
        const now = Date.now();
        if ((this.keyboard.SHIFT || this.keyboard.UP) && this.collectedBottles > 0 && (!this.lastThrowTime || now - this.lastThrowTime > 800)) {
            this.lastThrowTime = now;
            this.collectedBottles--;
            this.updateBottleBar();

            const offsetX = this.character.otherDirection ? -30 : 100;
            const throwDirection = this.character.otherDirection ? -1 : 1;

            let bottle = new ThrowableObjects(
                this.character.x + offsetX,
                this.character.y + 190,
                false,
                throwDirection
            );

            this.throwableObjects.push(bottle);
            this.addScore(1);
            this.character.playThrowAnimation();
            this.character.lastActionTime = Date.now();
        }
    }

    // Startet die Sarg-Animation nach dem Tod ...
    startCoffinAnimation() {
        this.showCoffin = true;
        this.coffinRotation = 0;

        let rotationSpeed = 15;
        let spins = 0;

        this.coffinSpin = setInterval(() => {
            this.coffinRotation += rotationSpeed;
            if (this.coffinRotation >= 360) {
                this.coffinRotation = 0;
                spins++;
            }
            if (spins >= 3) {
                clearInterval(this.coffinSpin);
            }
        }, 30);
    }

    // Zeigt das "You Win"-Endbild ...
    showVictoryScreen() {
        this.showYouWin = true;           // Flag aktivieren
        this.gameOver = true;             // Spielstatus auf beendet setzen
        this.keyboard = new Keyboard();   // Steuerung deaktivieren
    }


    // BEENDET das Spiel nach Tod des CHARAKTERS ...
    endGame() {
        this.gameOver = true;

        // Steuerung deaktivieren ...
        this.keyboard = new Keyboard();   // Alle Tasten auf FALSE zurücksetzen

        // Nur beim Tod des CHARAKTERS: Sarg-Animation und "Rest in Peace" anzeigen ...
        setTimeout(() => {
            this.startCoffinAnimation();
        }, 1500);
    }



    updateBottleBar() {
        let percentage = (this.collectedBottles / 5) * 100;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        this.bottleBar.setPercentage(percentage);
    }

    // ZEICHNUNG der SPIELWELT ...
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Hintergrund (Air + Landscape)
        this.ctx.translate(this.cameraX, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds); // Wolken direkt über Hintergrund

        // HUD-Elemente (fixe Position)
        this.ctx.translate(-this.cameraX, 0);
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bossBar);

        // Punkteanzeige
        this.ctx.font = "bold 40px Zabars";
        this.ctx.fillStyle = "#ffcc00";  // 🟡 Farbe der Score-Zahl geändert
        this.ctx.fillText(`Score: ${this.score}`, 550, 50);

        this.ctx.translate(this.cameraX, 0);

        // Spielobjekte
        this.addObjectsToMap(this.level.bottles);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);

        // Kamera wieder zurück
        this.ctx.translate(-this.cameraX, 0);

        // GAME OVER: SARG ZEICHNEN ...
        if (this.showCoffin) {
            const ctx = this.ctx;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const coffinWidth = 250;
            const coffinHeight = 150;

            // Sarg rotierend zeichnen ...
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(this.coffinRotation * Math.PI / 180);
            ctx.drawImage(
                this.coffinImg,
                -coffinWidth / 2,
                -coffinHeight / 2,
                coffinWidth,
                coffinHeight
            );
            ctx.restore();

            // Schriftzug "Rest in Peace" zeichnen ...
            ctx.save();
            ctx.font = "bold 90px Zabars";     // große, fette Schrift
            ctx.fillStyle = "yellow";          // gelbe Farbe
            ctx.textAlign = "center";          // horizontal zentrieren
            ctx.fillText("R . i . P.", centerX, centerY - coffinHeight + 65); // etwas über dem Sarg
            ctx.restore();
        }

        // GEWINN-BILD ANZEIGEN ...
        if (this.showYouWin) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 1.0;     // volle Deckkraft
            ctx.drawImage(this.youWinImg, 0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }

        // Wiederholtes Neuzeichnen ...
        const self = this;
        requestAnimationFrame(() => self.draw());
    }

    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }

    addToMap(movableObject) {
        if (movableObject.otherDirection) {
            this.flipImage(movableObject);
            movableObject.drawFrame(this.ctx);
        } else {
            movableObject.draw(this.ctx);
            movableObject.drawFrame(this.ctx);
        }
    }

    flipImage(movableObject) {
        this.ctx.save();
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.heigth);
        this.ctx.restore();
    }
}
