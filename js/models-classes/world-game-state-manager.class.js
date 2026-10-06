/**
 * Coordinates Game Over, Victory, restart, and menu transition flow.
 */
class WorldGameStateManager {
  constructor(world) {
    this.world = world;
  }

  /** Marks Pepe's death as the authoritative terminal state for this level. */
  markPlayerDefeated() {
    this.world.playerDefeated = true;
    this.world.gameOver = true;
  }

  /** Returns whether Pepe has already lost the current run. */
  isPlayerDefeated() {
    return this.world.playerDefeated || this.world.character.isDead();
  }

  /**
   * Starts the rotating coffin sequence after Pepe dies.
   */
  startCoffinAnimation() {
    const world = this.world;
    world.showCoffin = true;
    world.coffinRotation = 0;
    let rotationSpeed = 15;
    let spins = 0;

    world.coffinSpin = world.setManagedInterval(() => {
      world.coffinRotation += rotationSpeed;
      if (world.coffinRotation >= 360) {
        world.coffinRotation = 0;
        spins++;
      }
      if (spins >= 3 && rotationSpeed > 0) {
        rotationSpeed = this.slowCoffinRotation(rotationSpeed);
      }
    }, 30);
  }

  /**
   * Slows the coffin rotation and opens Game Over when the spin ends.
   *
   * @param {number} rotationSpeed - Current rotation speed.
   * @returns {number} Updated rotation speed.
   */
  slowCoffinRotation(rotationSpeed) {
    const world = this.world;
    const nextSpeed = rotationSpeed - 0.8;
    if (nextSpeed > 0) return nextSpeed;

    world.coffinRotation = 0;
    world.clearManagedInterval(world.coffinSpin);
    world.coffinSpin = null;
    this.showGameOverScreen();
    return 0;
  }

  /**
   * Opens the Game Over screen and binds its canvas actions.
   */
  showGameOverScreen() {
    const world = this.world;
    world.showGameOver = true;
    world.stopAllGameProcesses();
    world.silenceAllAudio();
    this.setGameOverButtonAreas();
    this.bindGameOverClickHandler();
    this.openGameOverHighscore();
  }

  /** Opens the existing highscore dialog only when the death score qualifies. */
  openGameOverHighscore() {
    const manager = this.world.highscoreManager;
    if (!manager || !manager.qualifiesForHighscore()) return;
    this.world.saveHighScoreEntry();
  }

  /** Calculates Game Over button hit areas. */
  setGameOverButtonAreas() {
    const world = this.world;
    const buttonHeight = 60;
    const buttonWidth = 220;
    const bottomY = world.canvas.height * 0.75;
    const centerX = world.canvas.width / 2;

    world.menuButtonArea = {
      x: centerX - buttonWidth - 40,
      y: bottomY,
      width: buttonWidth,
      height: buttonHeight,
    };
    world.tryAgainButtonArea = {
      x: centerX + 40,
      y: bottomY,
      width: buttonWidth,
      height: buttonHeight,
    };
  }

  /** Binds the Game Over canvas click handler. */
  bindGameOverClickHandler() {
    const world = this.world;
    const canvas = world.canvas;
    world.gameOverClickHandlerBound = (event) => {
      const point = getCanvasCoordinates(event, canvas);
      this.handleGameOverClick(point.x, point.y);
    };
    canvas.addEventListener("mousedown", world.gameOverClickHandlerBound);
  }

  /** Routes a Game Over click to restart or menu flow. */
  handleGameOverClick(x, y) {
    const world = this.world;
    this.detachGameOverClickHandler();

    if (this.isPointInArea(x, y, world.tryAgainButtonArea)) {
      this.restartGame();
      return;
    }

    world.setManagedTimeout(() => {
      world.showGameOver = false;
      this.returnToMenu();
    }, 500);
  }

  /** Removes the Game Over canvas click handler. */
  detachGameOverClickHandler() {
    const world = this.world;
    if (!world.gameOverClickHandlerBound) return;
    world.canvas.removeEventListener("mousedown", world.gameOverClickHandlerBound);
    world.gameOverClickHandlerBound = null;
  }

  /**
   * Stops the active World and restores the start menu.
   */
  returnToMenu() {
    const world = this.world;
    world.showCoffin = false;
    world.gameOver = true;
    world.destroy();
    world.stopBossProcesses();
    world.resetMenuInputState();
    world.resetMenuUiState();
  }

  /**
   * Routes a defeated Endboss to the next level or the final Victory flow.
   */
  handleBossDefeat() {
    const world = this.world;
    if (this.isPlayerDefeated()) return;
    if (world.levelManager.shouldTransitionToNextLevel()) {
      world.levelManager.completeLevel();
      return;
    }
    this.showVictoryScreen();
  }

  /**
   * Finalizes the current victory score and starts the final Victory flow.
   */
  showVictoryScreen() {
    const world = this.world;
    if (this.isPlayerDefeated()) return;
    world.stopAllGameProcesses();
    soundHub.stopBackgroundMusic();
    world.silenceAllAudio();
    world.addScore(this.calculateVictoryBonus());
    world.showYouWin = true;
    world.gameOver = true;
    world.keyboard = new Keyboard();

    world.setManagedTimeout(() => {
      world.saveHighScoreEntry();
      world.showVictoryOptions();
    }, 2000);
    world.startScoreBlink();
  }

  /**
   * Calculates the current end-of-game bonus.
   *
   * @returns {number} Bonus points to add to the score.
   */
  calculateVictoryBonus() {
    const world = this.world;
    const scoreConfig = world.levelConfig.score;
    const bottleBonus =
      world.collectedBottles * scoreConfig.remainingBottleMultiplier;
    const coinBonus = world.collectedCoins * scoreConfig.coinEndMultiplier;
    const healthBonus = Math.max(
      0,
      Math.round(world.character.energie * scoreConfig.remainingHealthMultiplier),
    );
    return bottleBonus + coinBonus + healthBonus;
  }

  /**
   * Stops combat activity and begins the death sequence.
   */
  endGame() {
    const world = this.world;
    this.cleanupBossAfterGameOver();
    world.gameOver = true;
    soundHub.stopBackgroundMusic();
    world.silenceAllAudio();
    world.freezeWorld();
    world.keyboard = new Keyboard();
    this.stopBossSounds();

    world.setManagedTimeout(() => {
      world.startCoffinAnimation();
    }, 1500);
  }

  /** Runs Endboss cleanup hooks before Game Over. */
  cleanupBossAfterGameOver() {
    const boss = this.findBoss();
    if (!boss || typeof boss.onGameOverCleanup !== "function") return;

    boss.onGameOverCleanup();
    if (typeof soundHub !== "undefined") {
      soundHub.stopEffect(soundHub.soundBossStart);
      soundHub.stopEffect(soundHub.soundBossCharge);
    }
  }

  /** Stops Endboss-owned sounds during terminal flow. */
  stopBossSounds() {
    const enemies = this.world.level && this.world.level.enemies;
    if (!enemies) return;

    enemies.forEach((enemy) => {
      if (
        enemy instanceof Endboss &&
        typeof enemy.stopAllBossSounds === "function"
      ) {
        enemy.stopAllBossSounds();
      }
    });
  }

  /** Returns the current Endboss instance when available. */
  findBoss() {
    const enemies = this.world.level && this.world.level.enemies;
    if (!enemies) return undefined;
    return enemies.find((enemy) => enemy instanceof Endboss);
  }

  /**
   * Restarts the game with a clean score and state.
   */
  restartGame() {
    const world = this.world;
    world.silenceAllAudio();
    world.processManager.stopBossBeforeRestart();
    world.ctx.clearRect(0, 0, world.canvas.width, world.canvas.height);
    world.showGameOver = false;
    world.gameOver = false;
    world.showCoffin = false;
    world.score = 0;
    world.blinkActive = false;
    world.blinkVisible = true;

    if (typeof score !== "undefined") score = 0;
    if (typeof startGame === "function") startGame();
  }

  /**
   * Tests whether a point lies inside a rectangular area.
   *
   * @param {number} x - Canvas x coordinate.
   * @param {number} y - Canvas y coordinate.
   * @param {{x:number,y:number,width:number,height:number}} area - Hit area.
   * @returns {boolean} Whether the point is inside the area.
   */
  isPointInArea(x, y, area) {
    if (!area) return false;
    return (
      x >= area.x &&
      x <= area.x + area.width &&
      y >= area.y &&
      y <= area.y + area.height
    );
  }
}
