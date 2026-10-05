class World {
  character = new Character();
  level;
  canvas;
  ctx;
  keyboard;
  currentLevel = 1;
  levelConfig;
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
  collisionManager;
  hudRenderer;
  gameStateManager;
  levelManager;
  processManager;
  highscoreManager;
  renderer;

  constructor(canvas, keyboard, levelInstance, levelConfig) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level = levelInstance;
    this.levelConfig = levelConfig;
    this.currentLevel = levelConfig.number;
    this.collisionManager = new WorldCollisionManager(this);
    this.hudRenderer = new WorldHudRenderer(this);
    this.processManager = new WorldProcessManager(this);
    this.gameStateManager = new WorldGameStateManager(this);
    this.levelManager = new WorldLevelManager(this);
    this.highscoreManager = new WorldHighscoreManager(this);
    this.renderer = new WorldRenderer(this);
    this.coffinImg.src = "./assets/img/2_charakter_pepe/5_dead/coffin.png";
    this.youWinImg.src = "./assets/img/0_you_won_you_lost/You Win A.png";
    this.gameOverImg.src =
      "./assets/img/9_intro_outro_bildschirm/game_over/game over.png";
    this.setWorld();
    this.levelManager.applyLevelSetup();
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

  /** Links the Character and enemies to this World instance. */
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

  /** Starts recurring collision and throw checks. */
  run() {
    soundHub.registerInterval(
      setInterval(() => {
        this.collisionManager.checkCollisions();
        this.checkThrowObjects();
      }, 30),
    );
  }

  /** Draws the temporary bottle pickup feedback. */
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

  /** Adds score points and displays temporary score feedback. */
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

  /** Creates thrown bottles when the current input and cooldown allow it. */
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

  /** Delegates the coffin sequence to the game-state manager. */
  startCoffinAnimation() { this.gameStateManager.startCoffinAnimation(); }

  /** Opens the Game Over screen after the coffin sequence. */
  waitAndReturnToMenu() { this.gameStateManager.showGameOverScreen(); }

  /** Delegates Game Over screen setup to the game-state manager. */
  showGameOverScreen() { this.gameStateManager.showGameOverScreen(); }

  /** Delegates the return-to-menu flow to the game-state manager. */
  returnToMenu() { this.gameStateManager.returnToMenu(); }

  /** Delegates boss-process cleanup to the process manager. */
  stopBossProcesses() { this.processManager.stopBossProcesses(); }

  /** Delegates input reset before returning to the menu. */
  resetMenuInputState() { this.processManager.resetMenuInputState(); }

  /** Delegates menu UI restoration to the process manager. */
  resetMenuUiState() { this.processManager.resetMenuUiState(); }

  /** Delegates global canvas sound-handler cleanup. */
  detachGlobalCanvasSoundHandler(canvas) { this.processManager.detachGlobalCanvasSoundHandler(canvas); }

  /** Routes an Endboss defeat to a level transition or final Victory. */
  handleBossDefeat() { this.gameStateManager.handleBossDefeat(); }

  /** Delegates the final Victory flow to the game-state manager. */
  showVictoryScreen() { this.gameStateManager.showVictoryScreen(); }

  /** Delegates the Game Over flow to the game-state manager. */
  endGame() { this.gameStateManager.endGame(); }

  /** Updates the bottle status bar from the current inventory. */
  updateBottleBar() {
    let percentage = (this.collectedBottles / 5) * 100;
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;
    this.bottleBar.setPercentage(percentage);
  }

  /** Updates the coin status bar from the current collection count. */
  updateCoinBar() {
    let percentage = (this.collectedCoins / 15) * 100;
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;
    this.coinBar.setPercentage(percentage);
  }

  /** Delegates complete audio shutdown to the process manager. */
  silenceAllAudio() { this.processManager.silenceAllAudio(); }

  /** Delegates frame rendering to the World renderer. */
  draw() { this.renderer.draw(); }

  /**
   * Returns the mobile HUD layout used by responsive controls.
   *
   * @returns {{edge:number,barWidth:number,barHeight:number,barY:number,bottom:number}}
   */
  getMobileHudLayout() {
    return this.hudRenderer.getMobileHudLayout();
  }

  /**
   * Handles clicks on the canvas sound icon.
   *
   * @param {number} x - Canvas x coordinate.
   * @param {number} y - Canvas y coordinate.
   */
  handleSoundIconClick(x, y) {
    this.hudRenderer.handleSoundIconClick(x, y);
  }

  /** Delegates collection rendering to the World renderer. */
  addObjectsToMap(objects) { this.renderer.addObjectsToMap(objects); }

  /** Delegates single-object rendering to the World renderer. */
  addToMap(movableObject) { this.renderer.addToMap(movableObject); }

  /** Delegates mirrored sprite rendering to the World renderer. */
  flipImage(movableObject) { this.renderer.flipImage(movableObject); }

  /** Delegates result-score blinking to the highscore manager. */
  startScoreBlink() { this.highscoreManager.startScoreBlink(); }

  /** Delegates highscore qualification to the highscore manager. */
  saveHighScoreEntry() { this.highscoreManager.saveHighScoreEntry(); }

  /** Delegates temporary highscore messages to the highscore manager. */
  showHighscoreMessage(text) { this.highscoreManager.showHighscoreMessage(text); }

  /** Delegates Victory options to the highscore manager. */
  showVictoryOptions() { this.highscoreManager.showVictoryOptions(); }

  /** Delegates Victory result rendering to the highscore manager. */
  drawVictoryOptions(ctx) { this.highscoreManager.drawVictoryOptions(ctx); }

  /** Delegates rectangular hit testing to the highscore manager. */
  isPointInArea(x, y, area) { return this.highscoreManager.isPointInArea(x, y, area); }

  /** Delegates Victory listener cleanup to the highscore manager. */
  detachVictoryClickHandler() { this.highscoreManager.detachVictoryClickHandler(); }

  /** Delegates a clean restart to the game-state manager. */
  restartGame() { this.gameStateManager.restartGame(); }

  /** Delegates world freezing to the process manager. */
  freezeWorld() { this.processManager.freezeWorld(); }

  /** Delegates global process cleanup to the process manager. */
  stopAllGameProcesses() { this.processManager.stopAllGameProcesses(); }

}
