/**
 * Coordinates terminal game states, cleanup, menu transitions, and restarts.
 */
class WorldGameStateManager {
  constructor(world) {
    this.world = world;
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
  }

  /**
   * Calculates the Game Over button hit areas.
   */
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

  /**
   * Binds the Game Over click handler to the canvas.
   */
  bindGameOverClickHandler() {
    const world = this.world;
    const canvas = world.canvas;

    world.gameOverClickHandlerBound = (event) => {
      const coordinates = getCanvasCoordinates(event, canvas);
      this.handleGameOverClick(coordinates.x, coordinates.y);
    };
    canvas.addEventListener("mousedown", world.gameOverClickHandlerBound);
  }

  /**
   * Routes a Game Over click to restart or menu.
   *
   * @param {number} x - Canvas x coordinate.
   * @param {number} y - Canvas y coordinate.
   */
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

  /**
   * Removes the Game Over canvas listener.
   */
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
    this.stopBossProcesses();
    this.resetMenuInputState();
    this.resetMenuUiState();
  }

  /**
   * Stops boss processes that can outlive normal gameplay intervals.
   */
  stopBossProcesses() {
    const world = this.world;
    if (typeof soundHub !== "undefined" && soundHub) {
      soundHub.stopBossCharge();
      soundHub.stopAllEffects();
      soundHub.stopBackgroundMusic();
    }
    if (!world.level || !world.level.enemies) return;

    world.level.enemies.forEach((enemy) => {
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
    const canvas = document.getElementById("canvas");
    const start = document.getElementById("startScreen");
    const controls = document.getElementById("mobileControls");

    if (canvas) {
      canvas.style.display = "none";
      this.detachGlobalCanvasSoundHandler(canvas);
    }
    if (start) start.style.display = "flex";
    if (controls) this.resetMobileControls(controls);
    window.world = null;
  }

  /**
   * Clears gameplay-only classes and offsets from mobile controls.
   *
   * @param {HTMLElement} controls - Mobile controls container.
   */
  resetMobileControls(controls) {
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
   * Finalizes the current victory score and starts the victory flow.
   */
  showVictoryScreen() {
    const world = this.world;
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
    const bottleBonus = world.collectedBottles * 3;
    const coinBonus = world.collectedCoins * 15;
    const healthBonus = Math.max(0, Math.round(world.character.energie * 0.7));
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

  /**
   * Runs boss cleanup hooks for Game Over.
   */
  cleanupBossAfterGameOver() {
    const boss = this.findBoss();
    if (!boss || typeof boss.onGameOverCleanup !== "function") return;

    boss.onGameOverCleanup();
    if (typeof soundHub !== "undefined") {
      soundHub.stopEffect(soundHub.soundBossStart);
      soundHub.stopEffect(soundHub.soundBossCharge);
    }
  }

  /**
   * Stops boss-owned sounds before terminal UI is shown.
   */
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

  /**
   * Finds the current Endboss.
   *
   * @returns {Endboss|undefined} Current boss instance.
   */
  findBoss() {
    const enemies = this.world.level && this.world.level.enemies;
    if (!enemies) return undefined;
    return enemies.find((enemy) => enemy instanceof Endboss);
  }

  /**
   * Stops all active game audio sources.
   */
  silenceAllAudio() {
    try {
      this.stopSoundHubAudio();
      this.stopCharacterAudio();
      this.stopEnemyAudio();
      this.stopDocumentAudio();
    } catch (error) {
      console.warn("Failed to silence all game audio:", error);
    }
  }

  /**
   * Stops SoundHub-owned music and effects.
   */
  stopSoundHubAudio() {
    if (typeof soundHub === "undefined" || !soundHub) return;
    if (typeof soundHub.stopBackgroundMusic === "function") soundHub.stopBackgroundMusic();
    if (typeof soundHub.stopAllEffects === "function") soundHub.stopAllEffects();
    if (typeof soundHub.stopBossCharge === "function") soundHub.stopBossCharge();
  }

  /**
   * Stops character-owned audio.
   */
  stopCharacterAudio() {
    const character = this.world.character;
    if (!character || !character.soundSnoring) return;

    try {
      character.soundSnoring.pause();
      character.soundSnoring.currentTime = 0;
    } catch (error) {}
  }

  /**
   * Stops boss-owned audio and timers.
   */
  stopEnemyAudio() {
    const enemies = this.world.level && this.world.level.enemies;
    if (!enemies) return;

    enemies.forEach((enemy) => {
      if (!(enemy instanceof Endboss)) return;
      if (typeof enemy.stopAllBossSounds === "function") enemy.stopAllBossSounds();
      if (typeof enemy.stopBossAudioAndTimers === "function") enemy.stopBossAudioAndTimers();
      if (typeof enemy.stopThunderAttackSound === "function") enemy.stopThunderAttackSound();
    });
  }

  /**
   * Stops any remaining audio elements in the document.
   */
  stopDocumentAudio() {
    const allAudio = document.getElementsByTagName("audio");
    for (let i = 0; i < allAudio.length; i++) {
      allAudio[i].pause();
      allAudio[i].currentTime = 0;
    }
  }

  /**
   * Restarts the game with a clean score and state.
   */
  restartGame() {
    const world = this.world;
    world.silenceAllAudio();
    this.stopBossBeforeRestart();
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
   * Stops boss activity before a restart.
   */
  stopBossBeforeRestart() {
    if (
      typeof soundHub === "undefined" ||
      typeof soundHub.stopBossCharge !== "function"
    ) {
      return;
    }

    soundHub.stopBossCharge();
    const enemies = this.world.level && this.world.level.enemies;
    if (!enemies) return;

    enemies.forEach((enemy) => {
      if (
        enemy instanceof Endboss &&
        typeof enemy.forceStopBossAudio === "function"
      ) {
        enemy.forceStopBossAudio();
      }
    });
  }

  /**
   * Freezes character, enemy, cloud, and background movement.
   */
  freezeWorld() {
    try {
      this.freezeCharacter();
      this.freezeEnemies();
      this.freezeObjects(this.world.level && this.world.level.clouds);
      this.freezeObjects(this.world.level && this.world.level.backgroundObjects);
    } catch (error) {
      console.warn("Failed to freeze the game world:", error);
    }
  }

  /**
   * Freezes the player character.
   */
  freezeCharacter() {
    const character = this.world.character;
    if (!character) return;
    character.speed = 0;
    character.acceleration = 0;
    if (typeof character.stopSnoringSound === "function") {
      character.stopSnoringSound();
    }
  }

  /**
   * Freezes enemies and stops their movement intervals.
   */
  freezeEnemies() {
    const enemies = this.world.level && this.world.level.enemies;
    if (!Array.isArray(enemies)) return;

    enemies.forEach((enemy) => {
      if (!enemy) return;
      enemy.speed = 0;
      enemy.acceleration = 0;
      this.clearEnemyInterval(enemy, "animateInterval");
      this.clearEnemyInterval(enemy, "chargeInterval");
      this.clearEnemyInterval(enemy, "walkAnimInterval");
    });
  }

  /**
   * Clears one enemy interval by property name.
   *
   * @param {object} enemy - Enemy that owns the interval.
   * @param {string} property - Interval property name.
   */
  clearEnemyInterval(enemy, property) {
    if (!enemy[property]) return;
    clearInterval(enemy[property]);
    enemy[property] = null;
  }

  /**
   * Freezes a collection of moving level objects.
   *
   * @param {Array|undefined} objects - Objects to freeze.
   */
  freezeObjects(objects) {
    if (!Array.isArray(objects)) return;
    objects.forEach((object) => {
      if (object) object.speed = 0;
    });
  }

  /**
   * Stops globally registered game processes and audio.
   */
  stopAllGameProcesses() {
    try {
      if (typeof soundHub !== "undefined" && soundHub) {
        soundHub.stopAllIntervals();
        soundHub.stopAllAudio();
      }
    } catch (error) {
      console.warn("Failed to stop game processes:", error);
    }
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
