class World {
  character = new Character(); // Charakter anlegen
  level = level1; // Level-Objekt laden
  canvas; // Canvas-Element
  ctx; // Canvas-Kontext
  keyboard; // Steuerung
  cameraX = 0; // Kamera-Verschiebung
  statusBar = new StatusBar("health"); // Lebensanzeige
  bottleBar = new StatusBar("bottle"); // Flaschenanzeige
  coinBar = new StatusBar("coins"); // Münz-Anzeige
  bossBar = new StatusBar("endboss"); // Lebensanzeige Endboss
  percentage = 100; // Lebens-Energie in %
  throwableObjects = []; // geworfene Flaschen
  collectedBottles = 3; // gesammelte Flaschen
  collectedCoins = 0; // gesammelte Münzen
  score = 0; // Punkte
  youWinImg = new Image(); // Bildobjekt für "You Win"
  gameOverImg = new Image(); // Bildobjekt für "Game Over"
  showYouWin = false; // Steuerung, ob das Bild angezeigt wird
  showGameOver = false; // Steuerung, ob Game-Over-Bild angezeigt wird
  blinkActive = false; // steuert, ob die Score-Anzeige blinken soll
  blinkVisible = true; // aktueller Sichtbarkeitszustand für Blinkeffekt

  // Variablen für Sarg-Animation ...
  coffinRotation = 0;
  showCoffin = false;
  coffinImg = new Image();
  coffinSpin = null;

  // Sieg-Overlay (Highscore + Buttons) ...
  showVictoryOptionsOverlay = false; // steuert Anzeige des Sieg-Overlays
  victoryWindowRect = null; // { x, y, width, height } des Fensters
  victoryMenuButtonArea = null; // Klickbereich "Menu"
  victoryPlayAgainButtonArea = null; // Klickbereich "Play again?"
  victoryClickHandlerBound = null; // Referenz auf den Canvas-Listener für das Overlay...

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.coffinImg.src = "./assets/img/2_charakter_pepe/5_dead/coffin.png"; // Sarg-Bild laden
    this.youWinImg.src = "./assets/img/0_you_won_you_lost/You Win A.png"; // You-Win-Bild laden
    this.gameOverImg.src =
      "./assets/img/9_intro_outro_bildschirm/game_over/game over.png"; // Game-Over-Bild laden
    this.setWorld();
    this.draw();
    this.run();
    this.score = score;
    this.updateBottleBar();

    // Klick ins Canvas nach Sieg öffnet die Sieg-Optionen (Highscore + Buttons) ...
    this.canvas.addEventListener(
      "mousedown",
      function () {
        if (this.gameOver && !this.showGameOver) {
          // Spieler hat GEWONNEN (showYouWin==true) → Sieg-Overlay mit Highscore + Buttons öffnen ...
          if (this.showYouWin) {
            this.showVictoryOptions(); // kein Reload mehr!
          }
        }
      }.bind(this),
    );

    // Klick auf das Sound-Icon im Canvas ...
    // this.canvas.addEventListener('mousedown', (event) => {
    //     const rect = this.canvas.getBoundingClientRect();
    //     const x = event.clientX - rect.left;
    //     const y = event.clientY - rect.top;
    //     this.handleSoundIconClick(x, y);
    // });
  }

  setWorld() {
    this.character.world = this; // Charakter kennt die Welt
    // Jeder Gegner im Level bekommt die Referenz auf die Welt ...
    this.level.enemies.forEach((enemy) => {
      enemy.world = this;
    });
  }

  run() {
    soundHub.registerInterval(
      setInterval(() => {
        this.checkCollisions();
        this.checkThrowObjects();
      }, 30),
    );
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

      const faelltNachUnten = this.character.speedY < 5;
      const charBottom =
        this.character.y +
        this.character.heigth -
        (this.character.offset ? this.character.offset.buttom : 0);
      const enemyTop = enemy.y + (enemy.offset ? enemy.offset.top : 0);
      const oberhalb = charBottom <= enemy.y + enemy.heigth * 0.7;

      if (faelltNachUnten && oberhalb && !enemy.isDeadChicken) {
        // Wenn es ein normales Huhn ist ...
        if (!(enemy instanceof Endboss)) {
          this.character.speedY = 25; // normaler Abprall
          this.character.y = enemyTop - this.character.heigth;
          soundHub.playEffect(soundHub.soundChickenHit); // Soundeffekt
          enemy.die();
          // Score-Punkte für Springen auf Huhn ...
          if (enemy instanceof LittleChicken) {
            this.addScore(15); // 15 Score-Punkte für Sprung auf KLEINES Huhn
          } else {
            this.addScore(20); // 20 Score-Punkte für Sprung auf GROSSES Huhn
          }
          setTimeout(() => {
            const index = this.level.enemies.indexOf(enemy);
            if (index > -1) this.level.enemies.splice(index, 1);
          }, 2000);
          soundHub.playEffect(soundHub.soundChickenMud); // Soundeffekt - Pepe Sprung auf Huhn
          continue;
        }

        // Wenn es der Endboss ist ...
        if (enemy instanceof Endboss && !enemy.isDeadBoss) {
          soundHub.playEffect(soundHub.soundChickenHit); // Soundeffekt
          enemy.wasHit(); // Endboss verliert Energie
          this.addScore(65); // 65 Score-Punkte für Springen auf Endboss

          // Pepe wird zur Seite geschleudert ...
          const bounceDistance = 300;
          const bounceForceY = 50;
          let bounceDirection;

          if (this.character.x < enemy.x) {
            bounceDirection = -1; // nach links wegfliegen
          } else {
            bounceDirection = 1; // nach rechts wegfliegen
          }

          // Grenzen prüfen ...
          const minX = 0;
          const maxX = this.level.levelEndX - this.character.width;
          const predictedX =
            this.character.x + bounceDistance * bounceDirection;

          if (predictedX < minX + 200 || predictedX > maxX - 200) {
            bounceDirection *= -1;
          }

          // Pepe nach oben und zur Seite katapultieren ...
          this.character.speedY = bounceForceY;
          this.character.x += bounceDistance * bounceDirection;

          this.character.isBouncingOffBoss = true;
          setTimeout(() => {
            this.character.isBouncingOffBoss = false;
            // nach der Abprall-Phase exakt auf Bodenhöhe setzen ...
            if (typeof this.character.snapToGround === "function") {
              this.character.snapToGround();
            }
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
        this.percentage =
          (this.character.energie / this.character.holeEnergie) * 100;
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
          this.addScore(20); // 20 Score-Punkte für Einsammeln einer Münze
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
      const boss = this.level.enemies.find(function (e) {
        return e instanceof Endboss;
      });
      if (!boss || boss.isDeadBoss) continue;

      const hit =
        bottle.x + bottle.width > boss.x + boss.offset.left &&
        bottle.x < boss.x + boss.width - boss.offset.right &&
        bottle.y + bottle.heigth > boss.y + boss.offset.top &&
        bottle.y < boss.y + boss.heigth - boss.offset.buttom;

      if (hit) {
        this.throwableObjects.splice(i, 1);
        boss.wasHit();
        this.addScore(40); // 40 Score-Punkte für Einsammeln einer Münze
        break;
      }
    }
  }

  collectBottle(index) {
    soundHub.playEffect(soundHub.soundBottlePickup);
    this.level.bottles.splice(index, 1);
    this.collectedBottles++;
    this.updateBottleBar();
    this.addScore(2); // 2 Score-Punkte für Einsammeln einer Flasche
    this.showBottlePickupEffect();
  }

  collectCoin(index) {
    soundHub.playEffect(soundHub.soundCoin);
    this.level.coins.splice(index, 1);
    this.collectedCoins++;
    this.updateCoinBar();
    this.addScore(3); // 3 Score-Punkte für Einsammeln einer Münze
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
    if (
      (this.keyboard.SHIFT || this.keyboard.UP) &&
      this.collectedBottles > 0 &&
      (!this.lastThrowTime || now - this.lastThrowTime > 800)
    ) {
      this.lastThrowTime = now;
      this.collectedBottles--;
      this.updateBottleBar();

      const offsetX = this.character.otherDirection ? -30 : 100;
      const throwDirection = this.character.otherDirection ? -1 : 1;

      let bottle = new ThrowableObjects(
        this.character.x + offsetX,
        this.character.y + 190,
        false,
        throwDirection,
      );

      this.throwableObjects.push(bottle);
      soundHub.playEffect(soundHub.soundThrow);
      this.addScore(3); // 3 Score-Punkte für Flaschenwurf
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
          self.coffinRotation = 0; // Sarg am Ende aufrecht
          clearInterval(self.coffinSpin);
          self.coffinSpin = null;
          self.waitAndReturnToMenu(); // Nach Stillstand weiter ...
        }
      }
    }, 30);
  }

  // Wartet nach Stillstand des Sarges und zeigt Game-Over-Bild ...
  waitAndReturnToMenu() {
    this.showGameOverScreen(); // Game-Over-Bild anzeigen ...
  }

  // Zeigt das Game-Over-Bild und reagiert auf Klick ...
  // Zeigt das Game-Over-Bild und reagiert auf Klick ...
  showGameOverScreen() {
    this.showGameOver = true;
    this.stopAllGameProcesses();
    this.silenceAllAudio();

    // Game-Over-Buttons anzeigen (Menu / Try again?) ...
    const canvas = this.canvas;
    const ctx = this.ctx;
    const buttonHeight = 60;
    const buttonWidth = 220;
    const bottomY = this.canvas.height * 0.75; // unteres Viertel des Canvas ...
    const centerX = this.canvas.width / 2;

    // Button-Positionen berechnen ...
    this.menuButtonArea = {
      x: centerX - buttonWidth - 40,
      y: bottomY,
      width: buttonWidth,
      height: buttonHeight,
    };
    this.tryAgainButtonArea = {
      x: centerX + 40,
      y: bottomY,
      width: buttonWidth,
      height: buttonHeight,
    };

    // Klick-Handler hinzufügen ...
    const self = this;
    function canvasClickHandler(event) {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      // Klick auf "Try again?" ...
      if (
        clickX >= self.tryAgainButtonArea.x &&
        clickX <= self.tryAgainButtonArea.x + self.tryAgainButtonArea.width &&
        clickY >= self.tryAgainButtonArea.y &&
        clickY <= self.tryAgainButtonArea.y + self.tryAgainButtonArea.height
      ) {
        canvas.removeEventListener("mousedown", canvasClickHandler);
        self.restartGame();
        return;
      }

      // Klick auf "Menu" ...
      if (
        clickX >= self.menuButtonArea.x &&
        clickX <= self.menuButtonArea.x + self.menuButtonArea.width &&
        clickY >= self.menuButtonArea.y &&
        clickY <= self.menuButtonArea.y + self.menuButtonArea.height
      ) {
        canvas.removeEventListener("mousedown", canvasClickHandler);
        setTimeout(function () {
          self.showGameOver = false;
          self.returnToMenu();
        }, 500);
        return;
      }

      // Klick auf freie Fläche ...
      canvas.removeEventListener("mousedown", canvasClickHandler);
      setTimeout(function () {
        self.showGameOver = false;
        self.returnToMenu();
      }, 500);
    }

    canvas.addEventListener("mousedown", canvasClickHandler);
  }

  // Blendet alles aus und kehrt ins Hauptmenü zurück ...
  returnToMenu() {
    this.showCoffin = false;
    this.gameOver = true;

    if (typeof soundHub !== "undefined" && soundHub) {
      if (typeof soundHub.stopBackgroundMusic === "function") {
        soundHub.stopBackgroundMusic();
        this.silenceAllAudio();
      }
      if (typeof soundHub.stopAllEffects === "function") {
        soundHub.stopAllEffects();
        this.silenceAllAudio();
      }
    }
    // Boss-Schrei und Sturmangriff sicher beenden ...
    if (
      typeof soundHub !== "undefined" &&
      typeof soundHub.stopBossCharge === "function"
    ) {
      soundHub.stopBossCharge();
      // ...Sicherheits-Stop des alten Endboss-Objekts...
      if (this.level && this.level.enemies) {
        for (var i = 0; i < this.level.enemies.length; i++) {
          var enemy = this.level.enemies[i];
          if (
            enemy instanceof Endboss &&
            typeof enemy.forceStopBossAudio === "function"
          ) {
            enemy.forceStopBossAudio();
          }
        }
      }
    }

    var cvs = document.getElementById("canvas");
    var start = document.getElementById("startScreen");
    if (cvs) cvs.style.display = "none";
    if (start) start.style.display = "flex";
    // Sicherheits-Reload, um wirklich alle Sounds und Timer zu beenden ...
    setTimeout(function () {
      location.reload();
    }, 1000); // kurze Verzögerung, bevor Menü kurz erscheint
  }

  // Zeigt das "You Win"-Endbild ...
  showVictoryScreen() {
    this.stopAllGameProcesses();
    soundHub.stopBackgroundMusic();
    this.silenceAllAudio();
    let bonusFlaschen = this.collectedBottles * 3;
    let bonusCoins = this.collectedCoins * 15;
    let bonusHealth = Math.max(0, Math.round(this.character.energie * 0.7));
    let totalBonus = bonusFlaschen + bonusCoins + bonusHealth;
    this.addScore(totalBonus);
    this.showYouWin = true;
    this.gameOver = true;
    this.keyboard = new Keyboard();

    setTimeout(() => {
      // Highscore speichern ...
      this.saveHighScoreEntry();

      // Nach Abschluss der Speicherung direkt Sieg-Optionen anzeigen ...
      if (typeof this.showVictoryOptions === "function") {
        this.showVictoryOptions();
      }
    }, 2000);
    this.startScoreBlink();
  }

  endGame() {
    // Endboss bei GAME-OVER (Pepe tot) sofort stilllegen ...
    if (this.level && this.level.enemies) {
      var boss = this.level.enemies.find(function (e) {
        return e instanceof Endboss;
      });
      if (boss && typeof boss.onGameOverCleanup === "function") {
        boss.onGameOverCleanup();
      }
    }
    this.gameOver = true;
    soundHub.stopBackgroundMusic();
    this.silenceAllAudio();
    if (typeof this.freezeWorld === "function") {
      this.freezeWorld();
    }
    this.keyboard = new Keyboard();
    // Sicherstellen, dass Endboss keine Sounds mehr spielt ...
    if (this.level && this.level.enemies) {
      this.level.enemies.forEach((enemy) => {
        if (
          enemy instanceof Endboss &&
          typeof enemy.stopAllBossSounds === "function"
        ) {
          enemy.stopAllBossSounds();
        }
      });
    }
    // Endboss bei GAME-OVER (Pepe tot) sofort stilllegen ...
    var boss = this.level.enemies.find(function (e) {
      return e instanceof Endboss;
    });
    if (boss && typeof boss.onGameOverCleanup === "function") {
      boss.onGameOverCleanup();
      if (typeof soundHub !== "undefined") {
        soundHub.stopEffect(soundHub.soundBossStart);
        soundHub.stopEffect(soundHub.soundBossCharge);
      }
    }
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

  /**
   * ===========================================================
   *  Stoppt ALLE Audioquellen (Musik, Effekte, Spezial-Sounds)
   *  -----------------------------------------------------------
   *  Wird bei Spielende, Sieg oder Rückkehr ins Menü aufgerufen.
   *  Stoppt:
   *   - Hintergrundmusik (soundHub)
   *   - Alle Effekt-Sounds (soundHub)
   *   - Endboss-Audios und Timer
   *   - Schnarchen des Charakters (lokale Instanz)
   * ===========================================================
   *  (C) Jürgen Malinowski – Letzte Bearbeitung: 01.11.2025 – 19:22 Uhr
   * ===========================================================
   */
  silenceAllAudio() {
    try {
      // === 1) Globale Hintergrundmusik stoppen ===
      if (typeof soundHub !== "undefined" && soundHub) {
        if (typeof soundHub.stopBackgroundMusic === "function") {
          soundHub.stopBackgroundMusic();
        }
        if (typeof soundHub.stopAllEffects === "function") {
          soundHub.stopAllEffects();
        }
        if (typeof soundHub.stopBossCharge === "function") {
          soundHub.stopBossCharge();
        }
      }

      // === 2) Lokales Schnarchen (Character) sicher stoppen ===
      if (this.character && this.character.soundSnoring) {
        try {
          this.character.soundSnoring.pause();
          this.character.soundSnoring.currentTime = 0;
        } catch (e) {}
      }

      // === 3) Boss-spezifische Sounds & Timer stoppen ===
      if (this.level && this.level.enemies) {
        for (var i = 0; i < this.level.enemies.length; i++) {
          var enemy = this.level.enemies[i];
          if (enemy instanceof Endboss) {
            // Timer / Sounds / Spezialattacken abbrechen
            if (typeof enemy.stopAllBossSounds === "function") {
              enemy.stopAllBossSounds();
            }
            if (typeof enemy.stopBossAudioAndTimers === "function") {
              enemy.stopBossAudioAndTimers();
            }
            if (typeof enemy.stopThunderAttackSound === "function") {
              enemy.stopThunderAttackSound();
            }
          }
        }
      }

      // === 4) Sicherheits-Mute aller laufenden Audios im DOM (Fallback) ===
      try {
        var allAudio = document.getElementsByTagName("audio");
        for (var j = 0; j < allAudio.length; j++) {
          allAudio[j].pause();
          allAudio[j].currentTime = 0;
        }
      } catch (e) {}
    } catch (err) {
      console.warn("Fehler in silenceAllAudio():", err);
    }
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
    this.ctx.fillText(this.collectedBottles + "", 175, 117);
    this.ctx.fillText(this.collectedCoins + "", 175, 175);
    this.ctx.restore();

    if (!this.blinkActive || (this.blinkActive && this.blinkVisible)) {
      this.ctx.font = "bold 40px Zabars";
      this.ctx.fillStyle = "#ffcc00";
      this.ctx.fillText("Score: " + this.score, 570, 50);
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
      var ctx = this.ctx;
      var centerX = this.canvas.width / 2;
      var centerY = this.canvas.height / 2;
      var coffinWidth = 250;
      var coffinHeight = 150;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((this.coffinRotation * Math.PI) / 180);
      ctx.drawImage(
        this.coffinImg,
        -coffinWidth / 2,
        -coffinHeight / 2,
        coffinWidth,
        coffinHeight,
      );
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
      var ctxYw = this.ctx;
      ctxYw.save();
      ctxYw.globalAlpha = 1.0;
      ctxYw.drawImage(
        this.youWinImg,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
      ctxYw.restore();
    }

    // Sieg-Overlay (Highscore + Buttons) anzeigen, sobald aktiviert ...
    if (this.showYouWin && this.showVictoryOptionsOverlay) {
      this.drawVictoryOptions(this.ctx);
    }

    // Sieg-Overlay (Highscore + Buttons) anzeigen, sobald aktiviert ...
    if (this.showYouWin && this.showVictoryOptionsOverlay) {
      this.drawVictoryOptions(this.ctx);
    }

    // Game-Over-Bild anzeigen ...
    if (this.showGameOver) {
      var ctxGo = this.ctx;
      ctxGo.save();
      ctxGo.globalAlpha = 1.0;
      ctxGo.drawImage(
        this.gameOverImg,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
      ctxGo.restore();

      // Buttons "Menu" und "Try again?" im unteren Viertel einblenden ...
      var buttonHeight = 60;
      var buttonWidth = 220;
      var spacing = 40;
      var cx = this.canvas.width / 2;
      var by = Math.floor(this.canvas.height * 0.75);

      // Fallback: Positions-Objekte sicherstellen ...
      if (!this.menuButtonArea) {
        this.menuButtonArea = {
          x: cx - buttonWidth - spacing,
          y: by,
          width: buttonWidth,
          height: buttonHeight,
        };
      }
      if (!this.tryAgainButtonArea) {
        this.tryAgainButtonArea = {
          x: cx + spacing,
          y: by,
          width: buttonWidth,
          height: buttonHeight,
        };
      }

      // Gemeinsame Zeichenparameter ...
      var ctxBtn = this.ctx;
      ctxBtn.save();
      ctxBtn.lineWidth = 4;
      ctxBtn.font = "bold 36px Zabars";
      ctxBtn.textBaseline = "middle";
      ctxBtn.textAlign = "center";

      // Button-Style gelb mit schwarzer Kontur ...
      function drawButtonRect(c, area) {
        c.fillStyle = "#ffcc00";
        c.strokeStyle = "black";
        c.fillRect(area.x, area.y, area.width, area.height);
        c.strokeRect(area.x, area.y, area.width, area.height);
      }

      // "Menu" ...
      drawButtonRect(ctxBtn, this.menuButtonArea);
      ctxBtn.fillStyle = "black";
      ctxBtn.fillText(
        "Menu",
        this.menuButtonArea.x + this.menuButtonArea.width / 2,
        this.menuButtonArea.y + this.menuButtonArea.height / 2,
      );

      // "Try again?" ...
      drawButtonRect(ctxBtn, this.tryAgainButtonArea);
      ctxBtn.fillStyle = "black";
      ctxBtn.fillText(
        "Try again?",
        this.tryAgainButtonArea.x + this.tryAgainButtonArea.width / 2,
        this.tryAgainButtonArea.y + this.tryAgainButtonArea.height / 2,
      );

      ctxBtn.restore();
    }

    // Sound-Symbol anzeigen (Ton an/aus) ...
    this.ctx.save();
    var iconSize = 80;
    var yPos = 60;
    this.ctx.font = "70px Zabars";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "white";
    if (soundHub.isMuted) {
      this.ctx.fillText("🔇", this.canvas.width / 2, yPos);
    } else {
      this.ctx.fillText("🔊", this.canvas.width / 2, yPos);
    }
    this.ctx.restore();

    var self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  handleSoundIconClick(x, y) {
    const iconSize = 80;
    const iconX = (this.canvas.width - iconSize) / 2;
    const iconY = 20; // obere Position (muss zur draw()-Position passen!)

    // Prüfen, ob Klick im Bereich des Symbols liegt
    if (
      x >= iconX &&
      x <= iconX + iconSize &&
      y >= iconY &&
      y <= iconY + iconSize
    ) {
      if (
        typeof soundHub !== "undefined" &&
        soundHub &&
        typeof soundHub.toggleMute === "function"
      ) {
        const wasMuted = soundHub.isMuted;
        soundHub.toggleMute();

        // Wenn Sound wieder eingeschaltet wurde → Musik erneut starten
        if (
          wasMuted &&
          !soundHub.isMuted &&
          typeof soundHub.playBackgroundMusic === "function"
        ) {
          soundHub.playBackgroundMusic();
        }

        // Audio-Menü-UI aktualisieren (Buttontext etc.)
        if (typeof syncAudioUIFromSoundHub === "function") {
          syncAudioUIFromSoundHub();
        }
      }
    }
  }

  addObjectsToMap(objects) {
    objects.forEach((o) => this.addToMap(o));
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
    this.ctx.drawImage(
      movableObject.img,
      0,
      0,
      movableObject.width,
      movableObject.heigth,
    );
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
    }, 500); // alle 0,5 Sekunden wechseln
  }

  /**
   * ===========================================================
   *  SPEICHERT DEN AKTUELLEN HIGHSCORE-EINTRAG (nur wenn Top 10)
   *  -----------------------------------------------------------
   *  - prüft, ob der aktuelle Score unter den Top 10 liegt
   *  - fügt den Eintrag hinzu, sortiert absteigend
   *  - markiert den neuesten Eintrag für spätere Blink-Darstellung
   * ===========================================================
   */
  saveHighScoreEntry() {
    var highScores = [];
    try {
      highScores = JSON.parse(localStorage.getItem("highScoreTable") || "[]");
    } catch (e) {
      highScores = [];
    }

    // Mindest-Score prüfen, wenn bereits 10 Einträge existieren …
    var minScore = 0;
    if (highScores.length >= 10) {
      highScores.sort(function (a, b) {
        return b.score - a.score;
      });
      minScore = highScores[highScores.length - 1].score;
    }

    if (highScores.length >= 10 && this.score <= minScore) {
      this.showHighscoreMessage("Not enough for the TOP-10 !");
      return;
    }

    // Neuer Highscore ... Namen erfragen ... in script.js
    if (typeof openHighscoreNameDialog === "function") {
      openHighscoreNameDialog(this.score);
    }

    // Neuen Eintrag hinzufügen und sortieren …
    var newEntry = { name: playerName, score: this.score };
    highScores.push(newEntry);
    highScores.sort(function (a, b) {
      return b.score - a.score;
    });
    if (highScores.length > 10) {
      highScores = highScores.slice(0, 10);
    }

    // Im localStorage speichern + Marker für den neuen Eintrag setzen …
    localStorage.setItem("highScoreTable", JSON.stringify(highScores));
    localStorage.setItem("newHighscoreEntry", JSON.stringify(newEntry));

    // Visuelle Bestätigung …
    if (typeof showHighscoreSavedOverlay === "function") {
      showHighscoreSavedOverlay();
    } else {
      this.showHighscoreMessage("🏆 Your high score has been saved !");
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

  // Öffnet das Sieg-Overlay (Highscore + Buttons) nach einem Klick bei "You Win" ...
  showVictoryOptions() {
    // Falls bereits sichtbar, nichts tun ...
    if (this.showVictoryOptionsOverlay) {
      return;
    }

    // Alle Audios absichern (insb. Boss-Schrei / Charge) ...
    this.silenceAllAudio();
    if (
      typeof soundHub !== "undefined" &&
      typeof soundHub.stopBossCharge === "function"
    ) {
      try {
        soundHub.stopBossCharge();
      } catch (e) {}
    }
    // zusätzlich das existierende Endboss-Objekt (falls noch im Array) hart stoppen ...
    try {
      if (this.level && this.level.enemies) {
        for (var i = 0; i < this.level.enemies.length; i++) {
          var enemy = this.level.enemies[i];
          if (enemy instanceof Endboss) {
            if (typeof enemy.stopAllBossSounds === "function") {
              enemy.stopAllBossSounds();
            }
            if (typeof enemy.stopBossAudioAndTimers === "function") {
              enemy.stopBossAudioAndTimers();
            }
          }
        }
      }
    } catch (e) {}

    // Overlay sichtbar schalten ...
    this.showVictoryOptionsOverlay = true;

    // Fenster- und Button-Geometrien vorbereiten ...
    var cvsW = this.canvas.width;
    var cvsH = this.canvas.height;

    // Highscore-Fenster etwas kleiner (ca. 70% Breite, 60% Höhe) ...
    var winW = Math.floor(cvsW * 0.7);
    var winH = Math.floor(cvsH * 0.72);
    var winX = Math.floor((cvsW - winW) / 2);
    var winY = Math.floor((cvsH - winH) / 2);

    this.victoryWindowRect = { x: winX, y: winY, width: winW, height: winH };

    // Buttons unter dem Fenster – gleiche Breite wie bei Game-Over ...
    var buttonWidth = 220;
    var buttonHeight = 45;
    var spacing = 40;

    // Abstand zwischen Highscore-Fenster und Buttons ...
    var by = winY + winH + 10;

    var cx = Math.floor(cvsW / 2);

    this.victoryMenuButtonArea = {
      x: cx - buttonWidth - spacing,
      y: by,
      width: buttonWidth,
      height: buttonHeight,
    };
    this.victoryPlayAgainButtonArea = {
      x: cx + spacing,
      y: by,
      width: buttonWidth,
      height: buttonHeight,
    };

    // Klick-Handler nur für das Sieg-Overlay (Buttons + Klick außerhalb) ...
    var self = this;
    this.victoryClickHandlerBound = function (event) {
      var rect = self.canvas.getBoundingClientRect();
      var clickX = event.clientX - rect.left;
      var clickY = event.clientY - rect.top;

      // 1) Klick auf "Play again?" → direkt neues Spiel ...
      if (self.isPointInArea(clickX, clickY, self.victoryPlayAgainButtonArea)) {
        self.detachVictoryClickHandler();
        self.showVictoryOptionsOverlay = false;
        self.restartGame();
        return;
      }

      // 2) Klick auf "Menu" → zurück ins Hauptmenü ...
      if (self.isPointInArea(clickX, clickY, self.victoryMenuButtonArea)) {
        self.detachVictoryClickHandler();
        self.showVictoryOptionsOverlay = false;
        self.returnToMenu();
        return;
      }

      // 3) Klick außerhalb des Fensters → wie "Menu"
      if (!self.isPointInArea(clickX, clickY, self.victoryWindowRect)) {
        self.detachVictoryClickHandler();
        self.showVictoryOptionsOverlay = false;
        self.returnToMenu();
        return;
      }
    };

    this.canvas.addEventListener("mousedown", this.victoryClickHandlerBound);
  }

  /**
   * ===========================================================
   *  ZEICHNET DAS SIEG-OVERLAY (Highscore + Buttons)
   *  -----------------------------------------------------------
   *  Erweiterung:
   *   – Der neueste Highscore-Eintrag blinkt rot (Erkennung via localStorage)
   * ===========================================================
   *  (C) Jürgen Malinowski – Letzte Bearbeitung: 02.11.2025 – 12:02 Uhr
   * ===========================================================
   */
  drawVictoryOptions(ctx) {
    if (!this.victoryWindowRect) {
      return;
    }

    var win = this.victoryWindowRect;

    // === 1) Fensterhintergrund ===
    ctx.save();
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.fillRect(win.x, win.y, win.width, win.height);
    ctx.strokeRect(win.x, win.y, win.width, win.height);

    // === 2) Titelzeile ===
    ctx.font = "bold 42px Zabars";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Highscore", win.x + Math.floor(win.width / 2), win.y + 15);

    // === 3) Highscore-Daten auslesen ===
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem("highScoreTable") || "[]");
    } catch (e) {
      list = [];
    }

    var newEntry = null;
    try {
      newEntry = JSON.parse(
        localStorage.getItem("newHighscoreEntry") || "null",
      );
    } catch (e) {
      newEntry = null;
    }

    if (list && list.length > 10) {
      list = list.slice(0, 10);
    }

    // === 4) Spaltenkoordinaten ===
    var colRankX = win.x + 40;
    var colNameX = win.x + 140;
    var colScoreX = win.x + win.width - 120;

    // === 5) Spaltenüberschriften ===
    ctx.font = "bold 28px Zabars";
    ctx.textAlign = "left";
    ctx.fillText("Rank", colRankX, win.y + 70);
    ctx.fillText("Name", colNameX, win.y + 70);
    ctx.textAlign = "right";
    ctx.fillText("Score", colScoreX, win.y + 70);

    // === 6) Layout-Parameter ===
    var maxVisibleRows = 10;
    var tableTop = win.y + 105;
    var tableBottom = win.y + win.height - 60;
    var availableHeight = tableBottom - tableTop;
    var baseFontSize = Math.max(20, Math.floor(win.height / 18));
    ctx.font = baseFontSize + "px Zabars";
    var lineH = Math.floor(baseFontSize * 1.15);
    var startY = tableTop;

    // === 7) Blink-Mechanismus ===
    var now = Date.now();
    var blinkOn = Math.floor(now / 500) % 2 === 0;

    // === 8) Highscore-Zeilen zeichnen ===
    for (var i = 0; i < list.length && i < maxVisibleRows; i++) {
      var entry = list[i];
      var rank = i + 1 + ".";
      var name = entry && entry.name ? entry.name : "Player";
      var scoreVal = entry && typeof entry.score === "number" ? entry.score : 0;
      var y = startY + i * lineH;

      var isHighlighted = false;
      if (
        newEntry &&
        entry.name === newEntry.name &&
        entry.score === newEntry.score
      ) {
        isHighlighted = true;
      }

      ctx.textAlign = "left";

      if (isHighlighted) {
        // Blinke-Effekt: rot sichtbar / unsichtbar
        if (blinkOn) {
          ctx.fillStyle = "red";
        } else {
          ctx.fillStyle = "white";
        }
      } else {
        ctx.fillStyle = "black";
      }

      ctx.fillText(rank, colRankX, y);
      ctx.fillText(name, colNameX, y);
      ctx.textAlign = "right";
      ctx.fillText(scoreVal + "", colScoreX, y);
    }

    ctx.restore();

    // === 9) Buttons zeichnen (wie bisher) ===
    if (!this.victoryMenuButtonArea || !this.victoryPlayAgainButtonArea) {
      return;
    }

    var btn = this.victoryMenuButtonArea;
    var btn2 = this.victoryPlayAgainButtonArea;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.font = "bold 32px Zabars";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    function drawButtonRect(c, area) {
      c.fillStyle = "#ffcc00";
      c.strokeStyle = "black";
      c.fillRect(area.x, area.y, area.width, area.height);
      c.strokeRect(area.x, area.y, area.width, area.height);
    }

    drawButtonRect(ctx, btn);
    ctx.fillStyle = "black";
    ctx.fillText(
      "Menu",
      btn.x + Math.floor(btn.width / 2),
      btn.y + Math.floor(btn.height / 2),
    );

    drawButtonRect(ctx, btn2);
    ctx.fillStyle = "black";
    ctx.fillText(
      "Play again?",
      btn2.x + Math.floor(btn2.width / 2),
      btn2.y + Math.floor(btn2.height / 2),
    );

    ctx.restore();
  }

  // Punkt-in-Rechteck-Prüfung (Hilfsfunktion für Button-Klicks) ...
  isPointInArea(x, y, area) {
    if (!area) {
      return false;
    }
    return (
      x >= area.x &&
      x <= area.x + area.width &&
      y >= area.y &&
      y <= area.y + area.height
    );
  }

  // Entfernt den temporären Klick-Handler des Sieg-Overlays ...
  detachVictoryClickHandler() {
    try {
      if (this.victoryClickHandlerBound) {
        this.canvas.removeEventListener(
          "mousedown",
          this.victoryClickHandlerBound,
        );
        this.victoryClickHandlerBound = null;
      }
    } catch (e) {}
  }

  // Startet das Spiel sofort neu (nach Klick auf "Try again?") ...
  restartGame() {
    // alle Sounds beenden, um Überlagerungen zu vermeiden...
    this.silenceAllAudio();
    // zusätzlich Boss-Schreie stoppen (Monsterschrei etc.) ...
    if (
      typeof soundHub !== "undefined" &&
      typeof soundHub.stopBossCharge === "function"
    ) {
      soundHub.stopBossCharge();
      // ...Sicherheits-Stop des alten Endboss-Objekts...
      if (this.level && this.level.enemies) {
        for (var i = 0; i < this.level.enemies.length; i++) {
          var enemy = this.level.enemies[i];
          if (
            enemy instanceof Endboss &&
            typeof enemy.forceStopBossAudio === "function"
          ) {
            enemy.forceStopBossAudio();
          }
        }
      }
    }
    // Canvas bleibt sichtbar, alte Elemente löschen...
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // Spielstatus zurücksetzen...
    this.showGameOver = false;
    this.gameOver = false;
    this.showCoffin = false;
    // direkt neues Spiel starten (wie in script.js -> startGame)...
    if (typeof startGame === "function") {
      startGame();
    } else {
      // Fallback: Seite neu laden, falls Funktion nicht gefunden...
      location.reload();
    }
  }

  /**
   * ===========================================================
   *  Friert ALLE Bewegungen und Animationen der Spielwelt ein
   *  -----------------------------------------------------------
   *  Wird bei Sieg (Endboss tot) oder Game-Over aufgerufen.
   *  Stoppt:
   *   - Charakterbewegung
   *   - Gegner / Endboss-Animationen
   *   - Wolken / Hintergrundbewegung
   *   - Alle periodischen Timer (soweit registriert)
   * ===========================================================
   */
  freezeWorld() {
    try {
      // === Charakter anhalten ===
      if (this.character) {
        this.character.speed = 0;
        this.character.acceleration = 0;
        if (typeof this.character.stopSnoringSound === "function") {
          this.character.stopSnoringSound();
        }
      }

      // === Gegner anhalten ===
      if (this.level && Array.isArray(this.level.enemies)) {
        for (var i = 0; i < this.level.enemies.length; i++) {
          var e = this.level.enemies[i];
          if (!e) continue;
          e.speed = 0;
          e.acceleration = 0;

          // Intervalls beenden (falls vorhanden)
          if (e.animateInterval) {
            clearInterval(e.animateInterval);
            e.animateInterval = null;
          }
          if (e.chargeInterval) {
            clearInterval(e.chargeInterval);
            e.chargeInterval = null;
          }
          if (e.walkAnimInterval) {
            clearInterval(e.walkAnimInterval);
            e.walkAnimInterval = null;
          }
        }
      }

      // === Wolken anhalten ===
      if (this.level && Array.isArray(this.level.clouds)) {
        for (var j = 0; j < this.level.clouds.length; j++) {
          if (this.level.clouds[j]) {
            this.level.clouds[j].speed = 0;
          }
        }
      }

      // === Hintergrundobjekte (Sicherheitsmaßnahme) ===
      if (this.level && Array.isArray(this.level.backgroundObjects)) {
        for (var k = 0; k < this.level.backgroundObjects.length; k++) {
          if (this.level.backgroundObjects[k]) {
            this.level.backgroundObjects[k].speed = 0;
          }
        }
      }

      console.log("🌍 freezeWorld(): Bewegung vollständig gestoppt.");
    } catch (err) {
      console.warn("Fehler in freezeWorld():", err);
    }
  }
  /**
   * ===========================================================
   *  Zentrale Steuerung für globale Stop-, Pause- und Reset-
   *  Ereignisse (Sound, Intervalle, Animationen, etc.)
   * ===========================================================
   */

  stopAllGameProcesses() {
    try {
      if (typeof soundHub !== "undefined" && soundHub) {
        soundHub.stopAllIntervals();
        soundHub.stopAllAudio();
      }
    } catch (e) {
      console.warn("Fehler beim Stoppen aller Prozesse:", e);
    }
  }

  pauseAllGameProcesses() {
    try {
      if (typeof soundHub !== "undefined" && soundHub) {
        soundHub.pauseAllAudio();
      }
    } catch (e) {
      console.warn("Fehler beim Pausieren:", e);
    }
  }

  resumeAllGameProcesses() {
    try {
      if (typeof soundHub !== "undefined" && soundHub) {
        soundHub.resumeAllAudio();
      }
    } catch (e) {
      console.warn("Fehler beim Fortsetzen:", e);
    }
  }
}
