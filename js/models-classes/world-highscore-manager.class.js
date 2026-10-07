/**
 * Handles highscore qualification and terminal highscore routing.
 */
class WorldHighscoreManager {
  constructor(world) {
    this.world = world;
  }

  /**
   * Starts the blinking score effect used during the result flow.
   */
  startScoreBlink() {
    const world = this.world;
    world.blinkActive = true;
    world.blinkVisible = true;
    if (world.scoreBlinkInterval !== null) return;

    world.scoreBlinkInterval = world.setManagedInterval(function () {
      if (!world.blinkActive) return;
      world.blinkVisible = !world.blinkVisible;
    }, 500);
  }

  /** Returns whether the current score qualifies for the stored Top 100. */
  qualifiesForHighscore() {
    const highScores = this.loadHighscores();
    const limit = typeof getHighscoreLimit === "function" ? getHighscoreLimit() : 100;
    if (highScores.length < limit) return true;
    return this.world.score > this.getMinimumQualifyingScore(highScores);
  }

  /** Opens name entry when the current score qualifies for the Top 100. */
  saveHighScoreEntry(context) {
    if (!this.qualifiesForHighscore()) {
      if (context === "victory") this.showVictoryOptions();
      else this.showHighscoreMessage("Not enough for the TOP 100!");
      return;
    }
    if (typeof openHighscoreNameDialog === "function") {
      openHighscoreNameDialog(this.world.score, context);
    }
  }

  /** Routes final Victory into qualification or the shared highscore view. */
  openVictoryHighscoreFlow() {
    if (this.qualifiesForHighscore()) {
      this.saveHighScoreEntry("victory");
      return;
    }
    this.showVictoryOptions();
  }

  /**
   * Reads the stored highscore table.
   *
   * @returns {Array} Stored highscore entries.
   */
  loadHighscores() {
    if (typeof readHighscores === "function") return readHighscores();
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
    if (typeof readNewestHighscoreEntry === "function") {
      return readNewestHighscoreEntry();
    }
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
    const limit = typeof getHighscoreLimit === "function" ? getHighscoreLimit() : 100;
    if (highScores.length < limit) return 0;
    const sortedScores = [...highScores].sort(function (a, b) {
      return b.score - a.score;
    });
    return sortedScores[limit - 1].score;
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

    this.world.setManagedTimeout(function () {
      overlay.remove();
    }, 3000);
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

  /** Opens the shared DOM highscore after final Victory. */
  showVictoryOptions() {
    const world = this.world;
    world.silenceAllAudio();
    this.stopVictoryBossAudio();
    if (typeof openHighscore === "function") openHighscore("victory");
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

    enemies.forEach(function (enemy) {
      if (!(enemy instanceof Endboss)) return;
      if (typeof enemy.stopAllBossSounds === "function") {
        enemy.stopAllBossSounds();
      }
      if (typeof enemy.stopBossAudioAndTimers === "function") {
        enemy.stopBossAudioAndTimers();
      }
    });
  }

}
