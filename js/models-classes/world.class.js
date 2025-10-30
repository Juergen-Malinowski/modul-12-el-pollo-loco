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
    gameOverImg = new Image();             // Bildobjekt für "Game Over"
    showYouWin = false;                    // Steuerung, ob das Bild angezeigt wird
    showGameOver = false;                  // Steuerung, ob Game-Over-Bild angezeigt wird
    blinkActive = false;                   // steuert, ob die Score-Anzeige blinken soll
    blinkVisible = true;                   // aktueller Sichtbarkeitszustand für Blinkeffekt
    soundIcon = new Image();               // Icon für Sound ist ausgeschaltet für Hinweis im Canvas

    // Variablen für Sarg-Animation ...
    coffinRotation = 0;
    showCoffin = false;
    coffinImg = new Image();
    coffinSpin = null;


    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.coffinImg.src = 'assets/img/2_charakter_pepe/5_dead/coffin.png';        // Sarg-Bild laden
        this.youWinImg.src = 'assets/img/0_you_won_you_lost/You Win A.png';          // You-Win-Bild laden
        this.gameOverImg.src = 'assets/img/9_intro_outro_bildschirm/game_over/game over.png';  // Game-Over-Bild laden
        this.soundIcon.src = 'assets/img/9_intro_outro_bildschirm/start/sound.gif';  // Sound-OFF-Icon laden
        this.setWorld();
        this.draw();
        this.run();
        this.score = score;
        this.updateBottleBar();

        // Klick ins Canvas startet das Spiel neu (nach Spielende) ...
        this.canvas.addEventListener('mousedown', () => {
            if (this.gameOver && !this.showGameOver) {
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

                // Wenn es ein normales Huhn ist ...
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

                // Wenn es der Endboss ist ...
                if (enemy instanceof Endboss && !enemy.isDeadBoss) {
                    soundHub.playEffect(soundHub.soundChickenHit);  // Soundeffekt
                    enemy.wasHit();             // Endboss verliert Energie
                    this.addScore(50);          // Punkte dafür

                    // Pepe wird zur Seite geschleudert ...
                    const bounceDistance = 300;
                    const bounceForceY = 50;
                    let bounceDirection;

                    if (this.character.x < enemy.x) {
                        bounceDirection = -1;   // nach links wegfliegen
                    } else {
                        bounceDirection = 1;    // nach rechts wegfliegen
                    }

                    // Grenzen prüfen ...
                    const minX = 0;
                    const maxX = this.level.levelEndX - this.character.width;
                    const predictedX = this.character.x + bounceDistance * bounceDirection;

                    if (predictedX < minX + 200 || predictedX > maxX - 200) {
                        bounceDirection *= -1;
                    }

                    // Pepe nach oben und zur Seite katapultieren ...
                    this.character.speedY = bounceForceY;
                    this.character.x += bounceDistance * bounceDirection;
                    this.character.y = enemyTop - this.character.heigth - 20;

                    this.character.isBouncingOffBoss = true;
                    setTimeout(() => {
                        this.character.isBouncingOffBoss = false;
                    }, 500);

                    continue;
                }
            }

            // Wenn Pepe getroffen wird ...
            if (!enemy.isDeadChicken) {
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

        // Kollisionen mit Flaschen, Münzen usw. ...
        for (let i = this.level.bottles.length - 1; i >= 0; i--) {
            const bottle = this.level.bottles[i];
            if (this.character.isColliding(bottle)) {
                this.collectBottle(i);
            }
        }

        for (let i = this.level.coins.length - 1; i >= 0; i--) {
            const coin = this.level.coins[i];
            if (this.character.isColliding(coin)) {
                this.collectCoin(i);
            }
        }

        // Flaschen gegen Hühner ...
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];
            if (bottle.y > 380) {
                this.throwableObjects.splice(i, 1);
                continue;
            }
            for (let j = this.level.enemies.length - 1; j >= 0; j--) {
                const enemy = this.level.enemies[j];
                if (enemy instanceof Endboss) continue;
                if (enemy.isDeadChicken) continue;

                const hit =
                    bottle.x + bottle.width > enemy.x + enemy.offset.left &&
                    bottle.x < enemy.x + enemy.width - enemy.offset.right &&
                    bottle.y + bottle.heigth > enemy.y + enemy.offset.top &&
                    bottle.y < enemy.y + enemy.heigth - enemy.offset.buttom;

                if (hit) {
                    soundHub.playEffect(soundHub.soundChickenHit);
                    enemy.die();
                    this.addScore(10);
                    this.throwableObjects.splice(i, 1);
                    setTimeout(() => {
                        const idx = this.level.enemies.indexOf(enemy);
                        if (idx > -1) this.level.enemies.splice(idx, 1);
                    }, 2000);
                    break;
                }
            }
        }

        // Flaschen gegen Endboss ...
        for (let i = this.throwableObjects.length - 1; i >= 0; i--) {
            const bottle = this.throwableObjects[i];
            const boss = this.level.enemies.find(function (e) { return e instanceof Endboss; });
            if (!boss || boss.isDeadBoss) continue;

            const hit =
                bottle.x + bottle.width > boss.x + boss.offset.left &&
                bottle.x < boss.x + boss.width - boss.offset.right &&
                bottle.y + bottle.heigth > boss.y + boss.offset.top &&
                bottle.y < boss.y + boss.heigth - boss.offset.buttom;

            if (hit) {
                this.throwableObjects.splice(i, 1);
                boss.wasHit();
                this.addScore(10);
                break;
            }
        }
    }


    collectBottle(index) {
        soundHub.playEffect(soundHub.soundBottlePickup);
        this.level.bottles.splice(index, 1);
        this.collectedBottles++;
        this.updateBottleBar();
        this.addScore(2);
        this.showBottlePickupEffect();
    }


    collectCoin(index) {
        soundHub.playEffect(soundHub.soundCoin);
        this.level.coins.splice(index, 1);
        this.collectedCoins++;
        this.updateCoinBar();
        this.addScore(3);
    }


    showBottlePickupEffect() {
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
        var rotationSpeed = 15;
        var spins = 0;
        var self = this;

        // Sarg-Animation: 3 Umdrehungen, dann langsam auslaufen ...
        this.coffinSpin = setInterval(function () {
            self.coffinRotation += rotationSpeed;
            if (self.coffinRotation >= 360) {
                self.coffinRotation = 0;
                spins++;
            }
            if (spins >= 3 && rotationSpeed > 0) {
                rotationSpeed -= 0.8;
                if (rotationSpeed <= 0) {
                    rotationSpeed = 0;
                    self.coffinRotation = 0;   // Sarg am Ende aufrecht
                    clearInterval(self.coffinSpin);
                    self.coffinSpin = null;
                    self.waitAndReturnToMenu();  // Nach Stillstand weiter ...
                }
            }
        }, 30);
    }


    // Wartet nach Stillstand des Sarges und zeigt Game-Over-Bild ...
    waitAndReturnToMenu() {
        this.showGameOverScreen();   // Game-Over-Bild anzeigen ...
    }


    // Zeigt das Game-Over-Bild und reagiert auf Klick ...
    showGameOverScreen() {
        this.showGameOver = true;

        const canvasClickHandler = () => {
            this.canvas.removeEventListener('mousedown', canvasClickHandler);
            setTimeout(() => {
                this.showGameOver = false;
                this.returnToMenu();
            }, 1000);
        };

        this.canvas.addEventListener('mousedown', canvasClickHandler);
    }


    // Blendet alles aus und kehrt ins Hauptmenü zurück ...
    returnToMenu() {
        this.showCoffin = false;
        this.gameOver = true;

        if (typeof soundHub !== "undefined" && soundHub) {
            if (typeof soundHub.stopBackgroundMusic === "function") {
                soundHub.stopBackgroundMusic();
            }
            if (typeof soundHub.stopAllEffects === "function") {
                soundHub.stopAllEffects();
            }
        }

        var cvs = document.getElementById('canvas');
        var start = document.getElementById('startScreen');
        if (cvs) cvs.style.display = 'none';
        if (start) start.style.display = 'flex';
    }


    // Zeigt das "You Win"-Endbild ...
    showVictoryScreen() {
        soundHub.stopBackgroundMusic();
        let bonusFlaschen = this.collectedBottles * 3;
        let bonusCoins = this.collectedCoins * 15;
        let bonusHealth = Math.max(0, Math.round(this.character.energie));
        let totalBonus = bonusFlaschen + bonusCoins + bonusHealth;
        this.addScore(totalBonus);
        this.showYouWin = true;
        this.gameOver = true;
        this.keyboard = new Keyboard();

        setTimeout(() => {
            this.saveHighScoreEntry();
        }, 2000);
        this.startScoreBlink();
    }


    endGame() {
        this.gameOver = true;
        soundHub.stopBackgroundMusic();
        this.keyboard = new Keyboard();
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


    updateCoinBar() {
        let percentage = (this.collectedCoins / 15) * 100;
        if (percentage > 100) percentage = 100;
        if (percentage < 0) percentage = 0;
        this.coinBar.setPercentage(percentage);
    }


    // Zeichnung der Spielwelt ...
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.cameraX, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);

        this.ctx.translate(-this.cameraX, 0);
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        this.addToMap(this.bossBar);

        this.ctx.save();
        this.ctx.font = "bold 36px Zabars";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "left";
        this.ctx.fillText(`${this.collectedBottles}`, 175, 117);
        this.ctx.fillText(`${this.collectedCoins}`, 175, 175);
        this.ctx.restore();

        if (!this.blinkActive || (this.blinkActive && this.blinkVisible)) {
            this.ctx.font = "bold 40px Zabars";
            this.ctx.fillStyle = "#ffcc00";
            this.ctx.fillText(`Score: ${this.score}`, 570, 50);
        }

        this.ctx.translate(this.cameraX, 0);
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.level.coins);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.cameraX, 0);

        // Sarg zeichnen ...
        if (this.showCoffin) {
            const ctx = this.ctx;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const coffinWidth = 250;
            const coffinHeight = 150;

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(this.coffinRotation * Math.PI / 180);
            ctx.drawImage(this.coffinImg, -coffinWidth / 2, -coffinHeight / 2, coffinWidth, coffinHeight);
            ctx.restore();

            ctx.save();
            ctx.font = "bold 90px Zabars";
            ctx.fillStyle = "yellow";
            ctx.textAlign = "center";
            ctx.fillText("R . i . P.", centerX, centerY - coffinHeight + 65);
            ctx.restore();
        }

        // Gewinn-Bild anzeigen ...
        if (this.showYouWin) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 1.0;
            ctx.drawImage(this.youWinImg, 0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }

        // Game-Over-Bild anzeigen ...
        if (this.showGameOver) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = 1.0;
            ctx.drawImage(this.gameOverImg, 0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }

        // Sound-Icon anzeigen ...
        if (soundHub.isMuted) {
            this.ctx.save();
            const iconSize = 80;
            const xPos = (this.canvas.width - iconSize) / 2;
            const yPos = 15;
            this.ctx.drawImage(this.soundIcon, xPos, yPos, iconSize, iconSize);
            this.ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
            this.ctx.lineWidth = 4;
            const shorten = iconSize / 6;
            this.ctx.beginPath();
            this.ctx.moveTo(xPos + 10 + shorten, yPos + 10 + shorten);
            this.ctx.lineTo(xPos + iconSize - 10 - shorten, yPos + iconSize - 10 - shorten);
            this.ctx.moveTo(xPos + iconSize - 10 - shorten, yPos + 10 + shorten);
            this.ctx.lineTo(xPos + 10 + shorten, yPos + iconSize - 10 - shorten);
            this.ctx.stroke();
            this.ctx.restore();
        }

        const self = this;
        requestAnimationFrame(() => self.draw());
    }


    addObjectsToMap(objects) {
        objects.forEach(o => this.addToMap(o));
    }


    addToMap(movableObject) {
        if (movableObject.otherDirection) {
            this.flipImage(movableObject);
        } else {
            movableObject.draw(this.ctx);
        }
    }


    flipImage(movableObject) {
        this.ctx.save();
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.heigth);
        this.ctx.restore();
    }

    // Score blinkend darstellen (nach Sieg) ...
    startScoreBlink() {
        this.blinkActive = true;
        this.blinkVisible = true;

        let self = this;
        setInterval(function () {
            if (!self.blinkActive) return;
            self.blinkVisible = !self.blinkVisible;
        }, 500);    // alle 0,5 Sekunden wechseln
    }


    // Speichert den aktuellen Highscore-Eintrag (Name + Punkte) ...
    saveHighScoreEntry() {
        let playerName = prompt("You won! Enter your name for the Highscore:", "Player");
        if (!playerName) {
            return;    // kein Eintrag ohne Namen
        }

        let highScores = JSON.parse(localStorage.getItem("highScoreTable") || "[]");
        highScores.push({
            name: playerName,
            score: this.score
        });

        localStorage.setItem("highScoreTable", JSON.stringify(highScores));

        // Anzeige des Overlays (aus script.js) ...
        if (typeof showHighscoreSavedOverlay === "function") {
            showHighscoreSavedOverlay();
        }
    }

    // Zeigt eine kurze Meldung zentriert über dem Canvas an ...
    showHighscoreMessage(text) {
        let overlay = document.createElement("div");
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

        // Automatisch nach 3 Sekunden ausblenden ...
        setTimeout(function () {
            overlay.remove();
        }, 3000);
    }


}
