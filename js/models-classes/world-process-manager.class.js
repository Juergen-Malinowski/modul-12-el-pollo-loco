/**
 * Owns World cleanup, audio shutdown, freezing, and menu reset operations.
 */
class WorldProcessManager {
  /**
   * Creates the process manager for one World.
   *
   * @param {World} world - Owning game World.
   */
  constructor(world) {
    this.world = world;
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

    world.level.enemies.forEach(function (enemy) {
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

    enemies.forEach(function (enemy) {
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

    const manager = this;
    enemies.forEach(function (enemy) {
      if (!enemy) return;
      enemy.speed = 0;
      enemy.acceleration = 0;
      manager.clearEnemyInterval(enemy, "animateInterval");
      manager.clearEnemyInterval(enemy, "chargeInterval");
      manager.clearEnemyInterval(enemy, "walkAnimInterval");
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
    objects.forEach(function (object) {
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
}
