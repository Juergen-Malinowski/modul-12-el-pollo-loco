class World {
  character = new Character();
  level = level1;
  canvas;
  ctx;
  keyboard;
  cameraX = 0;
  statusBar = new StatusBar("health");
  bottleBar = new StatusBar("bottle");
  coinBar = new StatusBar("coins");
  bossBar = new StatusBar("endboss");
  percentage = 100;
  throwableObjects = [];
  collectedBottles = 3;
  collectedCoins = 0;
  score = 0;
  youWinImg = new Image();
  gameOverImg = new Image();
  showYouWin = false;
  showGameOver = false;
  blinkActive = false;
  blinkVisible = true;
  scoreBlinkInterval = null;

  coffinRotation = 0;
  showCoffin = false;
  coffinImg = new Image();
  coffinSpin = null;

  showVictoryOptionsOverlay = false;
  victoryWindowRect = null;
  victoryMenuButtonArea = null;
  victoryPlayAgainButtonArea = null;
  victoryClickHandlerBound = null;
  animationFrameId = null;
  isRunning = true;
  canvasVictoryHandlerBound = null;
  gameOverClickHandlerBound = null;
  managedTimeouts = new Set();
  managedIntervals = new Set();

  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.coffinImg.src = "./assets/img/2_charakter_pepe/5_dead/coffin.png";
    this.youWinImg.src = "./assets/img/0_you_won_you_lost/You Win A.png";
    this.gameOverImg.src =
      "./assets/img/9_intro_outro_bildschirm/game_over/game over.png";
    this.setWorld();
    this.draw();
    this.run();
    this.score = score;
    this.updateBottleBar();

    this.canvasVictoryHandlerBound = function () {
      if (this.gameOver && !this.showGameOver) {

        if (this.showYouWin) {
          this.showVictoryOptions();
        }
      }
    }.bind(this);
    this.canvas.addEventListener("mousedown", this.canvasVictoryHandlerBound);

  }

  setWorld() {
    this.character.world = this;

    this.level.enemies.forEach((enemy) => {
      enemy.world = this;
    });
  }

  /**
   * Schedules a delayed callback owned by this World instance.
   *
   * @param {Function} callback - Callback to execute after the delay.
   * @param {number} delay - Delay in milliseconds.
   * @returns {number} Browser timeout identifier.
   */
  setManagedTimeout(callback, delay) {
    const timeoutId = setTimeout(() => {
      this.managedTimeouts.delete(timeoutId);
      callback();
    }, delay);
    this.managedTimeouts.add(timeoutId);
    return timeoutId;
  }

  /**
   * Cancels all delayed callbacks owned by this World instance.
   */
  clearManagedTimeouts() {
    this.managedTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    this.managedTimeouts.clear();
  }

  /**
   * Starts a recurring callback owned by this World instance.
   *
   * @param {Function} callback - Callback executed on every interval tick.
   * @param {number} delay - Interval delay in milliseconds.
   * @returns {number} Browser interval identifier.
   */
  setManagedInterval(callback, delay) {
    const intervalId = setInterval(callback, delay);
    this.managedIntervals.add(intervalId);
    return intervalId;
  }

  /**
   * Stops one World-owned interval and removes it from lifecycle tracking.
   *
   * @param {number|null} intervalId - Browser interval identifier.
   */
  clearManagedInterval(intervalId) {
    if (intervalId === null || intervalId === undefined) return;
    clearInterval(intervalId);
    this.managedIntervals.delete(intervalId);
  }

  /**
   * Stops every recurring callback owned by this World instance.
   */
  clearManagedIntervals() {
    this.managedIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.managedIntervals.clear();
  }

  /**
   * Stops rendering, global gameplay processes, listeners, and World-owned timers.
   */
  destroy() {
    this.isRunning = false;
    this.stopAllGameProcesses();
    this.clearManagedTimeouts();
    this.clearManagedIntervals();
    document
      .querySelectorAll(".highscoreMessageOverlay")
      .forEach((overlay) => overlay.remove());

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.canvas && this.canvasVictoryHandlerBound) {
      this.canvas.removeEventListener("mousedown", this.canvasVictoryHandlerBound);
      this.canvasVictoryHandlerBound = null;
    }

    if (this.canvas && this.gameOverClickHandlerBound) {
      this.canvas.removeEventListener("mousedown", this.gameOverClickHandlerBound);
      this.gameOverClickHandlerBound = null;
    }

    this.scoreBlinkInterval = null;
    this.blinkActive = false;

    this.detachVictoryClickHandler();
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

    if (this.gameOver) {
      return;
    }

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

        if (!(enemy instanceof Endboss)) {
          this.character.speedY = 25;
          this.character.y = enemyTop - this.character.heigth;
          soundHub.playEffect(soundHub.soundChickenHit);
          enemy.die();

          if (enemy instanceof LittleChicken) {
            this.addScore(15);
          } else {
            this.addScore(20);
          }
          this.setManagedTimeout(() => {
            const index = this.level.enemies.indexOf(enemy);
            if (index > -1) this.level.enemies.splice(index, 1);
          }, 2000);
          soundHub.playEffect(soundHub.soundChickenMud);
          continue;
        }

        if (enemy instanceof Endboss && !enemy.isDeadBoss) {
          soundHub.playEffect(soundHub.soundChickenHit);
          enemy.wasHit();
          this.addScore(65);

          const bounceDistance = 300;
          const bounceForceY = 50;
          let bounceDirection;

          if (this.character.x < enemy.x) {
            bounceDirection = -1;
          } else {
            bounceDirection = 1;
          }

          const minX = 0;
          const maxX = this.level.levelEndX - this.character.width;
          const predictedX =
            this.character.x + bounceDistance * bounceDirection;

          if (predictedX < minX + 200 || predictedX > maxX - 200) {
            bounceDirection *= -1;
          }

          this.character.speedY = bounceForceY;
          this.character.x += bounceDistance * bounceDirection;

          this.character.isBouncingOffBoss = true;
          this.setManagedTimeout(() => {
            this.character.isBouncingOffBoss = false;

            if (typeof this.character.snapToGround === "function") {
              this.character.snapToGround();
            }
          }, 500);
          continue;
        }
      }

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
          this.addScore(20);
          this.throwableObjects.splice(i, 1);
          this.setManagedTimeout(() => {
            const idx = this.level.enemies.indexOf(enemy);
            if (idx > -1) this.level.enemies.splice(idx, 1);
          }, 2000);
          break;
        }
      }
    }

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
        this.addScore(40);
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
    const interval = this.setManagedInterval(() => {
      ctx.save();
      ctx.font = "bold 30px Zabars";
      ctx.globalAlpha = opacity;
      ctx.fillStyle = getGameColor("--color-effect-bottle-pickup");
      ctx.fillText("+1", x - this.cameraX, y);
      ctx.restore();
      opacity -= 0.2;
      if (opacity <= 0) this.clearManagedInterval(interval);
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
    const interval = this.setManagedInterval(() => {
      ctx.save();
      ctx.font = "bold 25px Zabars";
      ctx.globalAlpha = opacity;
      ctx.fillStyle = getGameColor("--color-text-light");
      ctx.fillText(`+${points} Pts`, x - this.cameraX, y);
      ctx.restore();
      opacity -= 0.2;
      if (opacity <= 0) this.clearManagedInterval(interval);
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
      this.addScore(3);
      this.character.playThrowAnimation();
      this.character.lastActionTime = Date.now();
    }
  }

  startCoffinAnimation() {
    this.showCoffin = true;
    this.coffinRotation = 0;
    var rotationSpeed = 15;
    var spins = 0;
    var self = this;

    this.coffinSpin = this.setManagedInterval(function () {
      self.coffinRotation += rotationSpeed;
      if (self.coffinRotation >= 360) {
        self.coffinRotation = 0;
        spins++;
      }
      if (spins >= 3 && rotationSpeed > 0) {
        rotationSpeed -= 0.8;
        if (rotationSpeed <= 0) {
          rotationSpeed = 0;
          self.coffinRotation = 0;
          self.clearManagedInterval(self.coffinSpin);
          self.coffinSpin = null;
          self.waitAndReturnToMenu();
        }
      }
    }, 30);
  }

  waitAndReturnToMenu() {
    this.showGameOverScreen();
  }

  showGameOverScreen() {
    this.showGameOver = true;
    this.stopAllGameProcesses();
    this.silenceAllAudio();

    const canvas = this.canvas;
    const ctx = this.ctx;
    const buttonHeight = 60;
    const buttonWidth = 220;
    const bottomY = this.canvas.height * 0.75;
    const centerX = this.canvas.width / 2;

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

    const self = this;
    this.gameOverClickHandlerBound = function (event) {
      const coordinates = getCanvasCoordinates(event, canvas);
      const clickX = coordinates.x;
      const clickY = coordinates.y;

      if (
        clickX >= self.tryAgainButtonArea.x &&
        clickX <= self.tryAgainButtonArea.x + self.tryAgainButtonArea.width &&
        clickY >= self.tryAgainButtonArea.y &&
        clickY <= self.tryAgainButtonArea.y + self.tryAgainButtonArea.height
      ) {
        canvas.removeEventListener("mousedown", self.gameOverClickHandlerBound);
        self.gameOverClickHandlerBound = null;
        self.restartGame();
        return;
      }

      if (
        clickX >= self.menuButtonArea.x &&
        clickX <= self.menuButtonArea.x + self.menuButtonArea.width &&
        clickY >= self.menuButtonArea.y &&
        clickY <= self.menuButtonArea.y + self.menuButtonArea.height
      ) {
        canvas.removeEventListener("mousedown", self.gameOverClickHandlerBound);
        self.gameOverClickHandlerBound = null;
        self.setManagedTimeout(function () {
          self.showGameOver = false;
          self.returnToMenu();
        }, 500);
        return;
      }

      canvas.removeEventListener("mousedown", self.gameOverClickHandlerBound);
        self.gameOverClickHandlerBound = null;
      self.setManagedTimeout(function () {
        self.showGameOver = false;
        self.returnToMenu();
      }, 500);
    };

    canvas.addEventListener("mousedown", this.gameOverClickHandlerBound);
  }

  /**
   * Stops the current World and restores a clean start-menu state.
   */
  returnToMenu() {
    this.showCoffin = false;
    this.gameOver = true;
    this.destroy();
    this.stopBossProcesses();
    this.resetMenuInputState();
    this.resetMenuUiState();
  }

  /**
   * Stops boss-specific processes that may outlive normal gameplay intervals.
   */
  stopBossProcesses() {
    if (typeof soundHub !== "undefined" && soundHub) {
      soundHub.stopBossCharge();
      soundHub.stopAllEffects();
      soundHub.stopBackgroundMusic();
    }

    if (!this.level || !this.level.enemies) return;

    this.level.enemies.forEach((enemy) => {
      if (
        enemy instanceof Endboss &&
        typeof enemy.forceStopBossAudio === "function"
      ) {
        enemy.forceStopBossAudio();
      }
    });
  }

  /**
   * Clears keyboard and touch-control state before returning to the menu.
   */
  resetMenuInputState() {
    if (typeof resetMobileControlStates === "function") {
      resetMobileControlStates();
    }

    if (typeof keyboard === "undefined") return;

    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.UP = false;
    keyboard.DOWN = false;
    keyboard.SPACE = false;
    keyboard.SHIFT = false;
    keyboard.ENTER = false;
  }

  /**
   * Restores menu visibility and removes gameplay-only UI state.
   */
  resetMenuUiState() {
    var canvas = document.getElementById("canvas");
    var start = document.getElementById("startScreen");
    var controls = document.getElementById("mobileControls");

    if (canvas) {
      canvas.style.display = "none";
      this.detachGlobalCanvasSoundHandler(canvas);
    }
    if (start) start.style.display = "flex";
    if (controls) {
      controls.classList.remove(
        "isActive",
        "touchControlsEnabled",
        "controlsOutsideStage",
        "controlsOverlayStage",
      );
      controls.style.removeProperty("--left-control-offset");
      controls.style.removeProperty("--right-control-offset");
      controls.style.removeProperty("--overlay-control-top");
    }
    window.world = null;
  }

  /**
   * Removes the shared canvas sound handler when gameplay ends.
   *
   * @param {HTMLCanvasElement} canvas - Game canvas that owns the listener.
   */
  detachGlobalCanvasSoundHandler(canvas) {
    if (!window.__canvasSoundHandler) return;

    canvas.removeEventListener("mousedown", window.__canvasSoundHandler);
    window.__canvasSoundHandler = null;
  }

  /**
   * Finalizes the victory score and starts the delayed victory flow.
   */
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

    this.setManagedTimeout(() => {
      this.saveHighScoreEntry();

      if (typeof this.showVictoryOptions === "function") {
        this.showVictoryOptions();
      }
    }, 2000);
    this.startScoreBlink();
  }

  /**
   * Stops active combat state and starts the delayed game-over flow.
   */
  endGame() {

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
    this.setManagedTimeout(() => {
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

  silenceAllAudio() {
    try {

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

      if (this.character && this.character.soundSnoring) {
        try {
          this.character.soundSnoring.pause();
          this.character.soundSnoring.currentTime = 0;
        } catch (e) {}
      }

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
            if (typeof enemy.stopThunderAttackSound === "function") {
              enemy.stopThunderAttackSound();
            }
          }
        }
      }

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

  draw() {
    if (!this.isRunning) {
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.cameraX, 0);
    this.addObjectsToMap(this.level.backgroundObjects);
    this.addObjectsToMap(this.level.clouds);

    this.ctx.translate(-this.cameraX, 0);
    var mobileOverlayHud = this.isMobileOverlayHud();
    this.drawStatusHud(mobileOverlayHud);
    this.drawScoreHud(mobileOverlayHud);

    this.ctx.translate(this.cameraX, 0);
    this.addObjectsToMap(this.level.bottles);
    this.addObjectsToMap(this.level.coins);
    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObjects);
    this.ctx.translate(-this.cameraX, 0);

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
      ctx.fillStyle = getGameColor("--color-effect-bottle-pickup");
      ctx.textAlign = "center";
      ctx.fillText("R . i . P.", centerX, centerY - coffinHeight + 65);
      ctx.restore();
    }

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

    if (this.showYouWin && this.showVictoryOptionsOverlay) {
      this.drawVictoryOptions(this.ctx);
    }

    if (this.showYouWin && this.showVictoryOptionsOverlay) {
      this.drawVictoryOptions(this.ctx);
    }

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

      var buttonHeight = 60;
      var buttonWidth = 220;
      var spacing = 40;
      var cx = this.canvas.width / 2;
      var by = Math.floor(this.canvas.height * 0.75);

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

      var ctxBtn = this.ctx;
      ctxBtn.save();
      ctxBtn.lineWidth = 4;
      ctxBtn.font = "bold 36px Zabars";
      ctxBtn.textBaseline = "middle";
      ctxBtn.textAlign = "center";

      function drawButtonRect(c, area) {
        c.fillStyle = getGameColor("--color-ui-primary");
        c.strokeStyle = getGameColor("--color-border-dark");
        c.fillRect(area.x, area.y, area.width, area.height);
        c.strokeRect(area.x, area.y, area.width, area.height);
      }

      drawButtonRect(ctxBtn, this.menuButtonArea);
      ctxBtn.fillStyle = getGameColor("--color-text-dark");
      ctxBtn.fillText(
        "Menu",
        this.menuButtonArea.x + this.menuButtonArea.width / 2,
        this.menuButtonArea.y + this.menuButtonArea.height / 2,
      );

      drawButtonRect(ctxBtn, this.tryAgainButtonArea);
      ctxBtn.fillStyle = getGameColor("--color-text-dark");
      ctxBtn.fillText(
        "Try again?",
        this.tryAgainButtonArea.x + this.tryAgainButtonArea.width / 2,
        this.tryAgainButtonArea.y + this.tryAgainButtonArea.height / 2,
      );

      ctxBtn.restore();
    }

    this.drawSoundIcon(mobileOverlayHud);

    var self = this;
    this.animationFrameId = requestAnimationFrame(function () {
      self.draw();
    });
  }

  isMobileOverlayHud() {
    var controls = document.getElementById("mobileControls");
    return (
      this.isMobileControlsActive() &&
      controls.classList.contains("controlsOverlayStage")
    );
  }

  drawStatusHud(mobileOverlayHud) {
    this.setStatusBarLayout(mobileOverlayHud);
    this.addToMap(this.statusBar);
    this.addToMap(this.bottleBar);
    this.addToMap(this.coinBar);
    this.addToMap(this.bossBar);
    this.drawStatusValues(mobileOverlayHud);
  }

  getMobileHudLayout() {
    var edge = 10;
    var barWidth = 140;
    var barHeight = 46;
    var rowTop = 6;
    var rowHeight = 54;
    return {
      edge: edge,
      barWidth: barWidth,
      barHeight: barHeight,
      barY: rowTop + (rowHeight - barHeight) / 2,
      bottom: rowTop + rowHeight,
    };
  }

  setStatusBarLayout(mobileOverlayHud) {
    var bars = [this.statusBar, this.bottleBar, this.coinBar, this.bossBar];
    if (!mobileOverlayHud) {
      this.setDesktopStatusBarLayout(bars);
      return;
    }

    var layout = this.getMobileHudLayout();
    var gap = (this.canvas.width - layout.edge * 2 - layout.barWidth * bars.length) / (bars.length - 1);

    for (var i = 0; i < bars.length; i++) {
      bars[i].x = layout.edge + i * (layout.barWidth + gap);
      bars[i].y = layout.barY;
      bars[i].width = layout.barWidth;
      bars[i].heigth = layout.barHeight;
    }
  }

  setDesktopStatusBarLayout(bars) {
    var yPositions = [10, 70, 130, 190];
    for (var i = 0; i < bars.length; i++) {
      bars[i].x = 10;
      bars[i].y = yPositions[i];
      bars[i].width = 150;
      bars[i].heigth = 50;
    }
  }

  drawStatusValues(mobileOverlayHud) {
    this.ctx.save();
    this.ctx.font = mobileOverlayHud ? "bold 28px Zabars" : "bold 36px Zabars";
    this.ctx.fillStyle = getGameColor("--color-text-light");
    this.ctx.textAlign = "left";
    var bottlePosition = this.getBottleValuePosition(mobileOverlayHud);
    var coinPosition = this.getCoinValuePosition(mobileOverlayHud);
    this.ctx.fillText(this.collectedBottles + "", bottlePosition.x, bottlePosition.y);
    this.ctx.fillText(this.collectedCoins + "", coinPosition.x, coinPosition.y);
    this.ctx.restore();
  }

  getBottleValuePosition(mobileOverlayHud) {
    if (!mobileOverlayHud) return { x: 175, y: 117 };
    return {
      x: this.bottleBar.x + this.bottleBar.width + 5,
      y: this.bottleBar.y + this.bottleBar.heigth * 0.75,
    };
  }

  getCoinValuePosition(mobileOverlayHud) {
    if (!mobileOverlayHud) return { x: 175, y: 175 };
    return {
      x: this.coinBar.x + this.coinBar.width + 5,
      y: this.coinBar.y + this.coinBar.heigth * 0.75,
    };
  }

  drawScoreHud(mobileOverlayHud) {
    if (!this.blinkActive || (this.blinkActive && this.blinkVisible)) {
      var layout = this.getScoreLayout(mobileOverlayHud);
      this.ctx.save();
      this.ctx.font = "bold " + layout.fontSize + "px Zabars";
      this.ctx.fillStyle = getGameColor("--color-ui-primary");
      this.ctx.textAlign = layout.textAlign;
      this.ctx.textBaseline = "top";
      this.ctx.fillText("Score: " + this.score, layout.x, layout.y);
      this.ctx.restore();
    }
    this.drawGameControlHints(this.ctx, mobileOverlayHud);
  }

  getScoreLayout(mobileOverlayHud) {
    if (!mobileOverlayHud) {
      return { x: 570, y: 22, fontSize: 40, textAlign: "left" };
    }

    var hintPosition = this.getGameControlHintsPosition(true);
    var hintLeft = this.getGameControlHintsLeftEdge(hintPosition.x);
    var centerX = this.canvas.width / 2;
    var maxWidth = Math.max(100, (hintLeft - centerX - 12) * 2);
    var fontSize = this.getScoreFontSize("Score: " + this.score, maxWidth);

    return {
      x: centerX,
      y: hintPosition.y,
      fontSize: fontSize,
      textAlign: "center",
    };
  }

  getScoreFontSize(text, maxWidth) {
    var fontSize = 32;
    this.ctx.save();
    this.ctx.font = "bold " + fontSize + "px Zabars";
    var textWidth = this.ctx.measureText(text).width;
    this.ctx.restore();

    if (textWidth <= maxWidth) return fontSize;
    return Math.max(22, Math.floor(fontSize * (maxWidth / textWidth)));
  }

  drawGameControlHints(ctx, mobileOverlayHud = false) {
    var mobileControlsActive = this.isMobileControlsActive();
    var position = this.getGameControlHintsPosition(mobileOverlayHud);
    var fontSize = mobileControlsActive ? 24 : 16;
    var lineHeight = mobileControlsActive ? 30 : 30;

    ctx.save();
    ctx.font = "bold " + fontSize + "px Zabars";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "right";
    ctx.textBaseline = "top";

    ctx.fillText("⬅  Move left", position.x, position.y);
    ctx.fillText("➡  Move right", position.x, position.y + lineHeight);
    ctx.fillText(
      "SHIFT  or  ⬆  Throw bottle",
      position.x,
      position.y + lineHeight * 2,
    );
    ctx.fillText("SPACE  Jump", position.x, position.y + lineHeight * 3);

    ctx.restore();
  }

  isMobileControlsActive() {
    var controls = document.getElementById("mobileControls");
    return (
      controls &&
      controls.classList.contains("isActive") &&
      controls.classList.contains("touchControlsEnabled") &&
      window.matchMedia("(orientation: landscape)").matches
    );
  }

  /**
   * Resolves the control-hint anchor for the current HUD layout.
   *
   * @param {boolean} mobileOverlayHud - Whether touch controls overlap the stage.
   * @returns {{x: number, y: number}} Canvas coordinates for right-aligned hints.
   */
  getGameControlHintsPosition(mobileOverlayHud) {
    if (mobileOverlayHud) return this.getOverlayGameControlHintsPosition();
    return this.getRightAlignedGameControlHintsPosition();
  }

  /**
   * Keeps desktop and outside-stage control hints 20 CSS pixels from the stage edge.
   *
   * @returns {{x: number, y: number}} Canvas coordinates for the hint anchor.
   */
  getRightAlignedGameControlHintsPosition() {
    var stage = document.getElementById("gameStage");
    if (!stage) return { x: this.canvas.width - 20, y: 70 };

    var stageRect = stage.getBoundingClientRect();
    var scaleX = this.canvas.width / stageRect.width;
    return { x: this.canvas.width - 20 * scaleX, y: 70 };
  }

  getOverlayGameControlHintsPosition() {
    var stage = document.getElementById("gameStage");
    var rightControls = document.querySelector("#mobileControls .rightControls");
    var layout = this.getMobileHudLayout();
    if (!stage || !rightControls) return { x: 620, y: layout.bottom + 18 };

    var stageRect = stage.getBoundingClientRect();
    var controlRect = rightControls.getBoundingClientRect();
    var touchExtension = this.getMobileTouchInwardExtension();
    var scaleX = this.canvas.width / stageRect.width;
    var scaleY = this.canvas.height / stageRect.height;

    return {
      x: Math.max(
        120,
        (controlRect.left - touchExtension - 20 - stageRect.left) * scaleX,
      ),
      y: layout.bottom + 12 * scaleY,
    };
  }

  getMobileTouchInwardExtension() {
    var controls = document.getElementById("mobileControls");
    if (!controls) return 0;

    var value = getComputedStyle(controls).getPropertyValue(
      "--touch-inward-extension",
    );
    return parseFloat(value) || 0;
  }

  getGameControlHintsLeftEdge(rightEdge) {
    var lines = [
      "⬅  Move left",
      "➡  Move right",
      "SHIFT  or  ⬆  Throw bottle",
      "SPACE  Jump",
    ];
    var fontSize = this.isMobileControlsActive() ? 24 : 16;

    this.ctx.save();
    this.ctx.font = "bold " + fontSize + "px Zabars";
    var maxWidth = Math.max(...lines.map((line) => this.ctx.measureText(line).width));
    this.ctx.restore();

    return rightEdge - maxWidth;
  }

  drawSoundIcon(mobileOverlayHud) {
    var area = this.getSoundIconArea(mobileOverlayHud);
    this.ctx.save();
    this.ctx.font = "70px Zabars";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = getGameColor("--color-text-light");
    this.ctx.fillText(
      soundHub.isMuted ? "🔇" : "🔊",
      area.x + area.size / 2,
      area.y + area.size / 2,
    );
    this.ctx.restore();
  }

  getSoundIconArea(mobileOverlayHud = this.isMobileOverlayHud()) {
    var iconSize = 80;
    if (!mobileOverlayHud) {
      return { x: (this.canvas.width - iconSize) / 2, y: 20, size: iconSize };
    }
    return this.getMobileSoundIconArea(iconSize);
  }

  getMobileSoundIconArea(iconSize) {
    var stage = document.getElementById("gameStage");
    var leftControls = document.querySelector("#mobileControls .leftControls");
    var layout = this.getMobileHudLayout();
    if (!stage || !leftControls) return { x: 90, y: layout.bottom + 18, size: iconSize };

    var stageRect = stage.getBoundingClientRect();
    var controlRect = leftControls.getBoundingClientRect();
    var touchExtension = this.getMobileTouchInwardExtension();
    var scaleX = this.canvas.width / stageRect.width;
    var scaleY = this.canvas.height / stageRect.height;
    var x =
      (controlRect.right + touchExtension + 20 - stageRect.left) * scaleX;
    var y = layout.bottom + 12 * scaleY;

    return {
      x: Math.max(8, Math.min(x, this.canvas.width - iconSize - 8)),
      y: y,
      size: iconSize,
    };
  }

  handleSoundIconClick(x, y) {
    const area = this.getSoundIconArea();

    if (
      x >= area.x &&
      x <= area.x + area.size &&
      y >= area.y &&
      y <= area.y + area.size
    ) {
      if (
        typeof soundHub !== "undefined" &&
        soundHub &&
        typeof soundHub.toggleMute === "function"
      ) {
        const wasMuted = soundHub.isMuted;
        soundHub.toggleMute();

        if (
          wasMuted &&
          !soundHub.isMuted &&
          typeof soundHub.playBackgroundMusic === "function"
        ) {
          soundHub.playBackgroundMusic();
        }

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

  startScoreBlink() {
    this.blinkActive = true;
    this.blinkVisible = true;

    if (this.scoreBlinkInterval !== null) return;

    let self = this;
    this.scoreBlinkInterval = this.setManagedInterval(function () {
      if (!self.blinkActive) return;
      self.blinkVisible = !self.blinkVisible;
    }, 500);
  }

  saveHighScoreEntry() {
    var highScores = [];
    try {
      highScores = JSON.parse(localStorage.getItem("highScoreTable") || "[]");
    } catch (e) {
      highScores = [];
    }

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

    if (typeof openHighscoreNameDialog === "function") {
      openHighscoreNameDialog(this.score);
    }

  }

  /**
   * Shows a temporary message above the game canvas.
   *
   * @param {string} text - Message shown to the player.
   */
  showHighscoreMessage(text) {
    let overlay = document.createElement("div");
    overlay.className = "highscoreMessageOverlay";
    overlay.textContent = text;
    overlay.style.position = "fixed";
    overlay.style.top = "50%";
    overlay.style.left = "50%";
    overlay.style.transform = "translate(-50%, -50%)";
    overlay.style.backgroundColor = getGameColor("--color-surface-light");
    overlay.style.color = getGameColor("--color-text-dark");
    overlay.style.padding = "30px 50px";
    overlay.style.border = "4px solid " + getGameColor("--color-border-dark");
    overlay.style.borderRadius = "15px";
    overlay.style.fontFamily = "'Zabars', Arial, Helvetica, sans-serif";
    overlay.style.fontSize = "2em";
    overlay.style.textAlign = "center";
    overlay.style.zIndex = "9999";
    overlay.style.boxShadow = "0 0 15px " + getGameColor("--color-shadow-medium");
    document.body.appendChild(overlay);

    this.setManagedTimeout(function () {
      overlay.remove();
    }, 3000);
  }

  showVictoryOptions() {

    if (this.showVictoryOptionsOverlay) {
      return;
    }

    this.silenceAllAudio();
    if (
      typeof soundHub !== "undefined" &&
      typeof soundHub.stopBossCharge === "function"
    ) {
      try {
        soundHub.stopBossCharge();
      } catch (e) {}
    }

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

    this.showVictoryOptionsOverlay = true;

    var cvsW = this.canvas.width;
    var cvsH = this.canvas.height;

    var winW = Math.floor(cvsW * 0.7);
    var winH = Math.floor(cvsH * 0.72);
    var winX = Math.floor((cvsW - winW) / 2);
    var winY = Math.floor((cvsH - winH) / 2);

    this.victoryWindowRect = { x: winX, y: winY, width: winW, height: winH };

    var buttonWidth = 220;
    var buttonHeight = 45;
    var spacing = 40;

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

    var self = this;
    this.victoryClickHandlerBound = function (event) {
      var coordinates = getCanvasCoordinates(event, self.canvas);
      var clickX = coordinates.x;
      var clickY = coordinates.y;

      if (self.isPointInArea(clickX, clickY, self.victoryPlayAgainButtonArea)) {
        self.detachVictoryClickHandler();
        self.showVictoryOptionsOverlay = false;
        self.restartGame();
        return;
      }

      if (self.isPointInArea(clickX, clickY, self.victoryMenuButtonArea)) {
        self.detachVictoryClickHandler();
        self.showVictoryOptionsOverlay = false;
        self.returnToMenu();
        return;
      }

      if (!self.isPointInArea(clickX, clickY, self.victoryWindowRect)) {
        self.detachVictoryClickHandler();
        self.showVictoryOptionsOverlay = false;
        self.returnToMenu();
        return;
      }
    };

    this.canvas.addEventListener("mousedown", this.victoryClickHandlerBound);
  }

  drawVictoryOptions(ctx) {
    if (!this.victoryWindowRect) {
      return;
    }

    var win = this.victoryWindowRect;

    ctx.save();
    ctx.fillStyle = getGameColor("--color-surface-light");
    ctx.strokeStyle = getGameColor("--color-border-dark");
    ctx.lineWidth = 4;
    ctx.fillRect(win.x, win.y, win.width, win.height);
    ctx.strokeRect(win.x, win.y, win.width, win.height);

    ctx.font = "bold 42px Zabars";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Highscore", win.x + Math.floor(win.width / 2), win.y + 15);

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

    var colRankX = win.x + 40;
    var colNameX = win.x + 140;
    var colScoreX = win.x + win.width - 120;

    ctx.font = "bold 28px Zabars";
    ctx.textAlign = "left";
    ctx.fillText("Rank", colRankX, win.y + 70);
    ctx.fillText("Name", colNameX, win.y + 70);
    ctx.textAlign = "right";
    ctx.fillText("Score", colScoreX, win.y + 70);

    var maxVisibleRows = 10;
    var tableTop = win.y + 105;
    var tableBottom = win.y + win.height - 60;
    var availableHeight = tableBottom - tableTop;
    var baseFontSize = Math.max(20, Math.floor(win.height / 18));
    ctx.font = baseFontSize + "px Zabars";
    var lineH = Math.floor(baseFontSize * 1.15);
    var startY = tableTop;

    var now = Date.now();
    var blinkOn = Math.floor(now / 500) % 2 === 0;

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

        if (blinkOn) {
          ctx.fillStyle = getGameColor("--color-accent-danger");
        } else {
          ctx.fillStyle = getGameColor("--color-surface-light");
        }
      } else {
        ctx.fillStyle = getGameColor("--color-text-dark");
      }

      ctx.fillText(rank, colRankX, y);
      ctx.fillText(name, colNameX, y);
      ctx.textAlign = "right";
      ctx.fillText(scoreVal + "", colScoreX, y);
    }

    ctx.restore();

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
      c.fillStyle = getGameColor("--color-ui-primary");
      c.strokeStyle = getGameColor("--color-border-dark");
      c.fillRect(area.x, area.y, area.width, area.height);
      c.strokeRect(area.x, area.y, area.width, area.height);
    }

    drawButtonRect(ctx, btn);
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.fillText(
      "Menu",
      btn.x + Math.floor(btn.width / 2),
      btn.y + Math.floor(btn.height / 2),
    );

    drawButtonRect(ctx, btn2);
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.fillText(
      "Play again?",
      btn2.x + Math.floor(btn2.width / 2),
      btn2.y + Math.floor(btn2.height / 2),
    );

    ctx.restore();
  }

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

  restartGame() {

    this.silenceAllAudio();

    if (
      typeof soundHub !== "undefined" &&
      typeof soundHub.stopBossCharge === "function"
    ) {
      soundHub.stopBossCharge();

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

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.showGameOver = false;
    this.gameOver = false;
    this.showCoffin = false;

    this.score = 0;
    this.blinkActive = false;
    this.blinkVisible = true;

    if (typeof score !== "undefined") {
      score = 0;
    }

    if (typeof startGame === "function") {
      startGame();
    }
  }

  freezeWorld() {
    try {

      if (this.character) {
        this.character.speed = 0;
        this.character.acceleration = 0;
        if (typeof this.character.stopSnoringSound === "function") {
          this.character.stopSnoringSound();
        }
      }

      if (this.level && Array.isArray(this.level.enemies)) {
        for (var i = 0; i < this.level.enemies.length; i++) {
          var e = this.level.enemies[i];
          if (!e) continue;
          e.speed = 0;
          e.acceleration = 0;

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

      if (this.level && Array.isArray(this.level.clouds)) {
        for (var j = 0; j < this.level.clouds.length; j++) {
          if (this.level.clouds[j]) {
            this.level.clouds[j].speed = 0;
          }
        }
      }

      if (this.level && Array.isArray(this.level.backgroundObjects)) {
        for (var k = 0; k < this.level.backgroundObjects.length; k++) {
          if (this.level.backgroundObjects[k]) {
            this.level.backgroundObjects[k].speed = 0;
          }
        }
      }

    } catch (err) {
      console.warn("Failed to freeze the game world:", err);
    }
  }

  stopAllGameProcesses() {
    try {
      if (typeof soundHub !== "undefined" && soundHub) {
        soundHub.stopAllIntervals();
        soundHub.stopAllAudio();
      }
    } catch (e) {
      console.warn("Failed to stop game processes:", e);
    }
  }

}
