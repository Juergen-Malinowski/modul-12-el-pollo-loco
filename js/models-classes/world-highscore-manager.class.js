/**
 * Handles highscore qualification and the current Victory result overlay.
 */
class WorldHighscoreManager {
  constructor(world) {
    this.world = world;
    this.victoryRenderer = new WorldVictoryRenderer(world, this);
  }

  /**
   * Starts the blinking score effect used during the result flow.
   */
  startScoreBlink() {
    const world = this.world;
    world.blinkActive = true;
    world.blinkVisible = true;
    if (world.scoreBlinkInterval !== null) return;

    world.scoreBlinkInterval = world.setManagedInterval(() => {
      if (!world.blinkActive) return;
      world.blinkVisible = !world.blinkVisible;
    }, 500);
  }

  /** Returns whether the current score qualifies for the stored TOP-10. */
  qualifiesForHighscore() {
    const highScores = this.loadHighscores();
    if (highScores.length < 10) return true;
    return this.world.score > this.getMinimumQualifyingScore(highScores);
  }

  /**
   * Checks whether the current score qualifies for the stored TOP-10.
   */
  saveHighScoreEntry() {
    if (!this.qualifiesForHighscore()) {
      this.showHighscoreMessage("Not enough for the TOP-10 !");
      return;
    }

    if (typeof openHighscoreNameDialog === "function") {
      openHighscoreNameDialog(this.world.score);
    }
  }

  /**
   * Reads the stored highscore table.
   *
   * @returns {Array} Stored highscore entries.
   */
  loadHighscores() {
    try {
      const list = JSON.parse(localStorage.getItem("highScoreTable") || "[]");
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Reads the most recently stored highscore entry.
   *
   * @returns {object|null} Most recent highscore entry.
   */
  loadNewestHighscoreEntry() {
    try {
      return JSON.parse(localStorage.getItem("newHighscoreEntry") || "null");
    } catch (error) {
      return null;
    }
  }

  /**
   * Returns the lowest score that currently qualifies for the table.
   *
   * @param {Array} highScores - Stored highscore entries.
   * @returns {number} Minimum qualifying score.
   */
  getMinimumQualifyingScore(highScores) {
    if (highScores.length < 10) return 0;
    const sortedScores = [...highScores].sort((a, b) => b.score - a.score);
    return sortedScores[sortedScores.length - 1].score;
  }

  /**
   * Shows a temporary highscore status message above the game canvas.
   *
   * @param {string} text - Message shown to the player.
   */
  showHighscoreMessage(text) {
    const overlay = document.createElement("div");
    overlay.className = "highscoreMessageOverlay";
    overlay.textContent = text;
    this.styleHighscoreMessage(overlay);
    document.body.appendChild(overlay);

    this.world.setManagedTimeout(() => overlay.remove(), 3000);
  }

  /**
   * Applies the visual styling for the temporary highscore message.
   *
   * @param {HTMLElement} overlay - Message overlay element.
   */
  styleHighscoreMessage(overlay) {
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
    overlay.style.boxShadow =
      "0 0 15px " + getGameColor("--color-shadow-medium");
  }

  /**
   * Opens the Victory result overlay and binds its actions.
   */
  showVictoryOptions() {
    const world = this.world;
    if (world.showVictoryOptionsOverlay) return;

    world.silenceAllAudio();
    this.stopVictoryBossAudio();
    world.showVictoryOptionsOverlay = true;
    this.setVictoryAreas();
    this.bindVictoryClickHandler();
  }

  /**
   * Stops remaining boss audio before the Victory overlay opens.
   */
  stopVictoryBossAudio() {
    if (
      typeof soundHub !== "undefined" &&
      typeof soundHub.stopBossCharge === "function"
    ) {
      try {
        soundHub.stopBossCharge();
      } catch (error) {}
    }

    this.stopVictoryEnemyAudio();
  }

  /**
   * Stops boss-owned sounds and timers for the Victory overlay.
   */
  stopVictoryEnemyAudio() {
    const enemies = this.world.level && this.world.level.enemies;
    if (!enemies) return;

    enemies.forEach((enemy) => {
      if (!(enemy instanceof Endboss)) return;
      if (typeof enemy.stopAllBossSounds === "function") {
        enemy.stopAllBossSounds();
      }
      if (typeof enemy.stopBossAudioAndTimers === "function") {
        enemy.stopBossAudioAndTimers();
      }
    });
  }

  /**
   * Calculates the Victory window and button hit areas.
   */
  setVictoryAreas() {
    const world = this.world;
    const canvasWidth = world.canvas.width;
    const canvasHeight = world.canvas.height;
    const windowWidth = Math.floor(canvasWidth * 0.7);
    const windowHeight = Math.floor(canvasHeight * 0.72);
    const windowX = Math.floor((canvasWidth - windowWidth) / 2);
    const windowY = Math.floor((canvasHeight - windowHeight) / 2);

    world.victoryWindowRect = {
      x: windowX,
      y: windowY,
      width: windowWidth,
      height: windowHeight,
    };
    this.setVictoryButtonAreas(windowX, windowY, windowWidth, windowHeight);
  }

  /**
   * Calculates the Victory menu and replay button areas.
   */
  setVictoryButtonAreas(windowX, windowY, windowWidth, windowHeight) {
    const world = this.world;
    const buttonWidth = 220;
    const buttonHeight = 45;
    const spacing = 40;
    const buttonY = windowY + windowHeight + 10;
    const centerX = Math.floor(world.canvas.width / 2);

    world.victoryMenuButtonArea = {
      x: centerX - buttonWidth - spacing,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
    };
    world.victoryPlayAgainButtonArea = {
      x: centerX + spacing,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
    };
  }

  /**
   * Binds the Victory overlay click handler.
   */
  bindVictoryClickHandler() {
    const world = this.world;
    world.victoryClickHandlerBound = (event) => {
      const point = getCanvasCoordinates(event, world.canvas);
      this.handleVictoryClick(point.x, point.y);
    };
    world.canvas.addEventListener("mousedown", world.victoryClickHandlerBound);
  }

  /**
   * Routes Victory overlay clicks to replay or menu actions.
   *
   * @param {number} x - Canvas x coordinate.
   * @param {number} y - Canvas y coordinate.
   */
  handleVictoryClick(x, y) {
    const world = this.world;

    if (this.isPointInArea(x, y, world.victoryPlayAgainButtonArea)) {
      this.closeVictoryOverlay();
      world.restartGame();
      return;
    }
    if (this.isPointInArea(x, y, world.victoryMenuButtonArea)) {
      this.closeVictoryOverlay();
      world.returnToMenu();
      return;
    }
    if (!this.isPointInArea(x, y, world.victoryWindowRect)) {
      this.closeVictoryOverlay();
      world.returnToMenu();
    }
  }

  /**
   * Closes the Victory options overlay and removes its listener.
   */
  closeVictoryOverlay() {
    this.detachVictoryClickHandler();
    this.world.showVictoryOptionsOverlay = false;
  }

  /**
   * Draws the current Victory highscore window and action buttons.
   *
   * @param {CanvasRenderingContext2D} ctx - Game canvas context.
   */
  drawVictoryOptions(ctx) {
    this.victoryRenderer.drawVictoryOptions(ctx);
  }

  /**
   * Tests whether a point lies inside a rectangular area.
   *
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

  /**
   * Removes the Victory canvas listener.
   */
  detachVictoryClickHandler() {
    const world = this.world;
    if (!world.victoryClickHandlerBound) return;

    try {
      world.canvas.removeEventListener(
        "mousedown",
        world.victoryClickHandlerBound,
      );
      world.victoryClickHandlerBound = null;
    } catch (error) {}
  }
}
