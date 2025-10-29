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
    collectedCoins = 0;                    // gesammelte Münzen
    score = 0;                             // Punkte
    youWinImg = new Image();               // Bildobjekt für "You Win"
    showYouWin = false;                    // Steuerung, ob das Bild angezeigt wird
    blinkActive = false;                   // steuert, ob die Score-Anzeige blinken soll
    blinkVisible = true;                   // aktueller Sichtbarkeitszustand für Blinkeffekt


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
        // Klick ins Canvas startet das Spiel neu (nach Spielende) ...
        this.canvas.addEventListener('mousedown', () => {
            if (this.gameOver) {
                location.reload();   // Seite neu laden → Spiel wird neu gestartet
            }
        });

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

                // === Wenn es ein normales Huhn ist ===
                if (!(enemy instanceof Endboss)) {
                    this.character.speedY = 25;  // normaler Abprall
                    this.character.y = enemyTop - this.character.heigth;
                    soundHub.playEffect(soundHub.soundChickenHit);   // Soundeffekt
                    enemy.die();
                    this.addScore(20);        // Score-Punkte für Springen auf Huhn
                    setTimeout(() => {
                        const index = this.level.enemies.indexOf(enemy);
                        if (index > -1) this.level.enemies.splice(index, 1);
                    }, 2000);
                    soundHub.playEffect(soundHub.soundChickenMud);   // Soundeffekt - Pepe Sprung auf Huhn
                    continue;
                }

                // === Wenn es der Endboss ist ===
                if (enemy instanceof Endboss && !enemy.isDeadBoss) {
                    soundHub.playEffect(soundHub.soundChickenHit);  // Soundeffekt
                    // Treffer auslösen (Endboss verliert Energie)
                    enemy.wasHit();
                    this.addScore(50);             // 50 Score-Punkte dafür


                    // Pepe soll zur Seite weggeschleudert werden
                    const bounceDistance = 300;    // seitliche Entfernung nach Abprall
                    const bounceForceY = 50;       // vertikale Sprungkraft
                    let bounceDirection;           // Richtung des Abpralls (links oder rechts)

                    // Wenn Pepe links vom Boss war, dann fliegt er nach links — sonst nach rechts
                    if (this.character.x < enemy.x) {
                        bounceDirection = -1; // nach links wegfliegen
                    } else {
                        bounceDirection = 1;  // nach rechts wegfliegen
                    }

                    // Grenzen prüfen – wenn zu nah am Rand, dann Richtung umkehren
                    const minX = 0;
                    const maxX = this.level.levelEndX - this.character.width;
                    const predictedX = this.character.x + bounceDistance * bounceDirection;

                    if (predictedX < minX + 200 || predictedX > maxX - 200) {
                        bounceDirection *= -1;  // Umdrehen der Richtung
                    }

                    // Pepe nach oben und zur Seite katapultieren
                    this.character.speedY = bounceForceY;
                    this.character.x += bounceDistance * bounceDirection;
                    this.character.y = enemyTop - this.character.heigth - 20;

                    // kurze Bewegungssperre, damit der Spieler die Richtung nicht sofort umkehren kann
                    this.character.isBouncingOffBoss = true;
                    setTimeout(() => {
                        this.character.isBouncingOffBoss = false;
                    }, 500);

                    continue;
                }
            }


            if (!enemy.isDeadChicken) {
                // Sound nur abspielen, wenn Cooldown abgelaufen ...
                var now = Date.now();
                if (now - soundHub.lastHitSoundTime > soundHub.hitSoundCooldown) {
                    soundHub.playEffect(soundHub.soundHit);
                    soundHub.lastHitSoundTime = now;
                }
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

        // KOLLISION CHARAKTER mit MÜNZEN ...
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            const coin = this.level.coins[i];
            if (this.character.isColliding(coin)) {
                this.collectCoin(i);
            }
        }

        // KOLLISION CHARAKTER mit MÜNZEN ...
        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            const coin = this.level.coins[i];
            if (this.character.isColliding(coin)) {
                this.collectCoin(i);
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
                    soundHub.playEffect(soundHub.soundChickenHit);   // Soundeffekt
                    enemy.die();
                    this.addScore(10);        // Score-Punkte für Flaschenwurf auf Huhn
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
                this.addScore(10);   // Score-Punkte dafür
                break;               // Schleife abbrechen – nur ein Treffer pro Flasche zulassen
            }
        }
    }

    collectBottle(index) {
        soundHub.playEffect(soundHub.soundBottlePickup);   // Soundeffekt
        // FLASCHEN aufsammeln ...
        this.level.bottles.splice(index, 1);
        this.collectedBottles++;
        this.updateBottleBar();
        this.addScore(2);
        this.showBottlePickupEffect();
    }

    collectCoin(index) {
        soundHub.playEffect(soundHub.soundCoin);       // Soundeffekt
        this.level.coins.splice(index, 1);             // Münze entfernen ...
        this.collectedCoins++;                         // Zähler erhöhen ...
        this.updateCoinBar();                          // Statusbar aktualisieren ...
        this.addScore(3);                              // Score-Punkte für Sammeln einer Münze
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
            soundHub.playEffect(soundHub.soundThrow);
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
        
        soundHub.stopBackgroundMusic();                     // Hintergrundmusik stoppen ...
        let bonusFlaschen = this.collectedBottles * 3;      // Score-Punkte pro unbenutzte Flasche ...
        let bonusCoins = this.collectedCoins * 15;          // Score-Punkte  pro gesammelte Münze ...
        let bonusHealth = Math.max(0, Math.round(this.character.energie));   // Score-Punkte  basierend auf verbleibender Lebensenergie ...
        let totalBonus = bonusFlaschen + bonusCoins + bonusHealth;           // Gesamtbonus berechnen ...
        this.addScore(totalBonus);                          // Bonus-Score-Punkte dem Score hinzufügen ...
        // Spielende-Flags ...
        this.showYouWin = true;
        this.gameOver = true;
        this.keyboard = new Keyboard();

        // Spielername abfragen + Tabelle speichern (mit kurzer Pause
        // für WIN-Bild) ...
        setTimeout(() => {
            this.saveHighScoreEntry();   // Spielername + Tabelle anzeigen
        }, 2000);                        // 4 Sekunde warten
        // Punkteanzeige blinken lassen ...
        this.startScoreBlink();
    }

    // BEENDET das Spiel nach Tod des CHARAKTERS ...
    endGame() {
        this.gameOver = true;
        soundHub.stopBackgroundMusic();   // Musik stoppen
        // Steuerung deaktivieren ...
        this.keyboard = new Keyboard();   // Alle Tasten auf FALSE zurücksetzen
        // Nur beim Tod des CHARAKTERS: Sarg-Animation und "Rest in Peace" anzeigen ...
        setTimeout(() => {
            this.startCoffinAnimation();
        }, 1500);
    }

    updateBottleBar() {
        // Prozentanteil der Flaschen berechnen ... 
        let percentage = (this.collectedBottles / 5) * 100;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        this.bottleBar.setPercentage(percentage);
    }

    updateCoinBar() {
        // Prozentanteil der Münzen berechnen ...
        let percentage = (this.collectedCoins / 15) * 100;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        this.coinBar.setPercentage(percentage);
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
        // ANZAHL DER FLASCHEN und MÜNZEN als Zahl hinter der Status-Bar ...
        this.ctx.save();
        this.ctx.font = "bold 36px Zabars";         // große, fette Schrift
        this.ctx.fillStyle = "white";               // weiße Farbe
        this.ctx.textAlign = "left";                // linksbündig (passt zur Bar)
        this.ctx.fillText(`${this.collectedBottles}`, 175, 117); // Position leicht rechts von der Bottle-Bar
        this.ctx.fillText(`${this.collectedCoins}`, 175, 175);   // Position leicht rechts von der Coin-Bar
        this.ctx.restore();


        // Punkteanzeige
        if (!this.blinkActive || (this.blinkActive && this.blinkVisible)) {
            this.ctx.font = "bold 40px Zabars";
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.fillText(`Score: ${this.score}`, 570, 50);
        }


        this.ctx.translate(this.cameraX, 0);

        // Spielobjekte
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.coins);
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

    startScoreBlink() {
        this.blinkActive = true;
        this.blinkVisible = true;
        // Blinken alle 500 ms (2x pro Sekunde) ...
        this.blinkInterval = setInterval(() => {
            this.blinkVisible = !this.blinkVisible;
            this.blinkColor = this.blinkVisible ? "#ffcc00" : "#ffffff";
            // Wenn das Spiel irgendwann komplett neu gestartet wird, abbrechen ...
            if (this.gameOver && !this.showYouWin) {
                clearInterval(this.blinkInterval);
                this.blinkActive = false;
            }
        }, 700);
    }


    // ===============================================
    // HIGHSCORE-SYSTEM (TOP 10 MIT NAMEN)
    // ===============================================
    saveHighScoreEntry() {

        // Verhindert Mehrfachausführung
        if (this.highscoreAlreadySaved) {
            return;
        }
        this.highscoreAlreadySaved = true;

        // --- Highscore-Tabelle laden ---
        var storedData = localStorage.getItem('highScoreTable');
        var highScores = storedData ? JSON.parse(storedData) : [];

        // --- Prüfen, ob Score für TOP 10 reicht ---
        var minScore = 0;
        if (highScores.length > 0) {
            // niedrigsten Score in der bestehenden Liste finden
            minScore = highScores[highScores.length - 1].score;
        }

        var qualifies =
            highScores.length < 10 || this.score > minScore;

        // --- Wenn NICHT qualifiziert ---
        if (!qualifies) {
            // Kurze Nachricht: nicht in TOP 10
            this.showHighscoreMessage("😢 SORRY, not enough for the TOP 10 !");
            return;
        }

        // --- Wenn qualifiziert: Name abfragen ---
        var playerName = prompt("Congratulations! You are one of the TOP 10! Please enter your name:", "Player");
        if (!playerName) {
            playerName = "unknown";
        }

        // --- Eintrag anlegen und hinzufügen ---
        var newEntry = {
            name: playerName.trim(),
            score: this.score,
            date: new Date().toLocaleDateString('de-DE')
        };

        highScores.push(newEntry);

        // --- Sortieren und auf 10 begrenzen ---
        highScores.sort(function (a, b) { return b.score - a.score; });
        if (highScores.length > 10) {
            highScores = highScores.slice(0, 10);
        }

        // --- Speichern ---
        localStorage.setItem('highScoreTable', JSON.stringify(highScores));

        // --- Nachricht: Erfolgreich gespeichert ---
        this.showHighscoreMessage("✅ Your high score has been saved!");
    }

    /**
     * Zeigt eine kurze Meldung zentriert über dem Canvas an
     * (z. B. „Highscore gespeichert“ oder „nicht geschafft“)
     */
    showHighscoreMessage(text) {
        var overlay = document.createElement("div");
        overlay.textContent = text;
        overlay.style.position = "fixed";
        overlay.style.top = "50%";
        overlay.style.left = "50%";
        overlay.style.transform = "translate(-50%, -50%)";
        overlay.style.backgroundColor = "white";
        overlay.style.color = "black";
        overlay.style.padding = "30px 50px";
        overlay.style.border = "4px solid black";
        overlay.style.borderRadius = "15px";
        overlay.style.fontFamily = "'Zabars', Arial, Helvetica, sans-serif";
        overlay.style.fontSize = "2em";
        overlay.style.textAlign = "center";
        overlay.style.zIndex = "9999";
        overlay.style.boxShadow = "0 0 15px rgba(0,0,0,0.5)";

        document.body.appendChild(overlay);

        // Automatisch nach 3 Sekunden ausblenden
        setTimeout(() => {
            overlay.remove();
        }, 3000);
    }


    displayHighScoreTable() {
        // HIGH-SCORE-Daten speichern für spätere Ausgabe ...
        var storedData = localStorage.getItem('highScoreTable');
        if (!storedData) {
            return [];
        }
        return JSON.parse(storedData);
    }
}
