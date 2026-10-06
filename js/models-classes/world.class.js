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
  collectedBottles = 0;
  maxBottlesLevel = 1;
  collectedCoins = 0;
  score = 0;
  youWinImg = new Image();
  gameOverImg = new Image();
  showYouWin = false;
  showGameOver = false;
  playerDefeated = false;
  isPaused = false;
  blinkActive = false;
  blinkVisible = true;
  scoreBlinkInterval = null;

  coffinRotation = 0;
  showCoffin = false;
  coffinImg = new Image();
  coffinSpin = null;

  animationFrameId = null;
  isRunning = true;
  gameOverClickHandlerBound = null;
  managedTimeouts = new Set();
  managedIntervals = new Set();
  collisionManager;
  stompComboManager;
  batFlightManager;
  hudRenderer;
  gameStateManager;
  levelManager;
  processManager;
  highscoreManager;
  renderer;

  constructor(canvas, keyboard, levelInstance, levelConfig) {
    this.initializeDependencies(canvas, keyboard, levelInstance, levelConfig);
    this.initializeCharacterHealth();
    this.initializeBottleInventory();
    this.initializeManagers();
    this.initializeResultImages();
    this.setWorld();
    this.levelManager.applyLevelSetup();
    this.draw();
    this.run();
    this.initializeResourceState();
    this.startInitialBatFlight();
  }

  /** Stores the dependencies and level metadata required by this World. */
  initializeDependencies(canvas, keyboard, levelInstance, levelConfig) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.level = levelInstance;
    this.levelConfig = levelConfig;
    this.currentLevel = levelConfig.number;
  }

  /** Creates manager and renderer instances owned by this World. */
  initializeManagers() {
    this.collisionManager = new WorldCollisionManager(this);
    this.stompComboManager = new WorldStompComboManager(this);
    this.batFlightManager = new WorldBatFlightManager(this);
    this.hudRenderer = new WorldHudRenderer(this);
    this.processManager = new WorldProcessManager(this);
    this.pauseManager = new WorldPauseManager(this);
    this.gameStateManager = new WorldGameStateManager(this);
    this.levelManager = new WorldLevelManager(this);
    this.highscoreManager = new WorldHighscoreManager(this);
    this.renderer = new WorldRenderer(this);
  }

  /** Starts the one automatic Bat flight when Level 1 begins. */
  startInitialBatFlight() {
    if (this.currentLevel === 1) this.batFlightManager.startFlight();
  }

  /** Assigns terminal-state image sources. */
  initializeResultImages() {
    this.coffinImg.src = "./assets/img/2_charakter_pepe/5_dead/coffin.png";
    this.youWinImg.src = "./assets/img/0_you_won_you_lost/You Win A.png";
    this.gameOverImg.src =
      "./assets/img/9_intro_outro_bildschirm/game_over/game over.png";
  }

  /** Restores the accumulated score and initializes resource bars. */
  initializeResourceState() {
    this.score = score;
    this.updateBottleBar();
    this.updateCoinBar();
  }

  /** Initializes Pepe with the configured full health for the current level. */
  initializeCharacterHealth() {
    this.character.holeEnergie = this.levelConfig.characterEnergy;
    this.character.energie = this.levelConfig.characterEnergy;
    this.percentage = 100;
    this.statusBar.setPercentage(this.percentage);
  }

  /** Initializes the current bottle inventory and its fixed level maximum. */
  initializeBottleInventory() {
    const startingBottles = getBottleCarryover() + this.levelConfig.startBottleCount;
    this.collectedBottles = startingBottles;
    this.maxBottlesLevel = startingBottles + this.levelConfig.groundBottleCount;
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
    const world = this;
    const intervalId = setInterval(function () {
      if (!world.isPaused) callback();
    }, delay);
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

    if (this.canvas && this.gameOverClickHandlerBound) {
      this.canvas.removeEventListener("mousedown", this.gameOverClickHandlerBound);
      this.gameOverClickHandlerBound = null;
    }

    this.scoreBlinkInterval = null;
    this.blinkActive = false;
  }

  /** Starts recurring collision and throw checks. */
  run() {
    const world = this;
    soundHub.registerInterval(
      setInterval(function () {
        if (world.isPaused) return;
        world.collisionManager.checkCollisions();
        world.checkThrowObjects();
      }, 30),
    );
  }

  /** Delegates temporary bottle pickup feedback to the renderer. */
  showBottlePickupEffect() {
    this.renderer.showBottlePickupEffect();
  }

  /** Adds score points and displays temporary score feedback. */
  addScore(points) {
    this.score += points;
    score = this.score;
    this.renderer.showScoreFeedback(points);
  }

  /** Creates thrown bottles when the current input and cooldown allow it. */
  checkThrowObjects() {
    if (this.gameOver || this.playerDefeated) return;
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
      this.addScore(this.levelConfig.score.bottleThrow);
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

  /** Updates the bottle bar against the fixed maximum available in this level. */
  updateBottleBar() {
    let percentage = (this.collectedBottles / this.maxBottlesLevel) * 100;
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;
    this.bottleBar.setPercentage(percentage);
  }

  /** Updates the coin bar against the configured number of coins in this level. */
  updateCoinBar() {
    let percentage = (this.collectedCoins / this.levelConfig.coinCount) * 100;
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;
    this.coinBar.setPercentage(percentage);
  }

  /** Toggles gameplay pause while the active level is running. */
  togglePause() { this.pauseManager.togglePause(); }

  /** Routes canvas HUD clicks to sound and pause controls. */
  handleHudClick(x, y) { this.hudRenderer.handleHudClick(x, y); }

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
  saveHighScoreEntry(context) { this.highscoreManager.saveHighScoreEntry(context); }

  /** Delegates temporary highscore messages to the highscore manager. */
  showHighscoreMessage(text) { this.highscoreManager.showHighscoreMessage(text); }

  /** Delegates a clean restart to the game-state manager. */
  restartGame() { this.gameStateManager.restartGame(); }

  /** Delegates world freezing to the process manager. */
  freezeWorld() { this.processManager.freezeWorld(); }

  /** Delegates global process cleanup to the process manager. */
  stopAllGameProcesses() { this.processManager.stopAllGameProcesses(); }

}
