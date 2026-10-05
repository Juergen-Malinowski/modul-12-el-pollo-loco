/**
 * Applies level-specific world scaling and coordinates successful level transitions.
 */
class WorldLevelManager {
  constructor(world) {
    this.world = world;
  }

  /**
   * Scales existing Level 1 spawn ranges to the configured world width.
   */
  applyLevelScale() {
    const scale = this.world.levelConfig.levelEndX / getLevelConfig(1).levelEndX;
    if (scale !== 1) {
      this.scaleEnemies(scale);
      this.scaleCollectibles(this.world.level.bottles, 200, scale);
      this.scaleCollectibles(this.world.level.coins, 300, scale);
    }
    this.extendBackgroundToLevelEnd();
  }

  /** Scales normal enemies and configures the Endboss position. */
  scaleEnemies(scale) {
    this.world.level.enemies.forEach((enemy) => {
      if (enemy instanceof Endboss) {
        this.scaleBoss(enemy, scale);
        return;
      }
      enemy.x = 450 + (enemy.x - 450) * scale;
    });
  }

  /** Scales the Endboss start, movement limit, and alert position. */
  scaleBoss(boss, scale) {
    boss.x *= scale;
    boss.maxX *= scale;
    boss.alertX *= scale;
  }

  /** Scales collectible spawn positions from their Level 1 base range. */
  scaleCollectibles(items, baseX, scale) {
    items.forEach((item) => {
      item.x = baseX + (item.x - baseX) * scale;
      if (typeof item.centerX === "number") {
        item.centerX = item.x + item.width / 2;
      }
    });
  }

  /** Extends alternating background segments beyond the configured level end. */
  extendBackgroundToLevelEnd() {
    const segmentWidth = 720;
    const targetX = Math.ceil(this.world.level.levelEndX / segmentWidth) * segmentWidth;
    let nextX = this.getLastBackgroundX() + segmentWidth;
    while (nextX <= targetX) {
      this.addBackgroundSegment(nextX, segmentWidth);
      nextX += segmentWidth;
    }
  }

  /** Returns the greatest x-position currently used by a background segment. */
  getLastBackgroundX() {
    const backgrounds = this.world.level.backgroundObjects;
    let lastX = -720;
    for (let i = 0; i < backgrounds.length; i++) {
      if (backgrounds[i].x > lastX) lastX = backgrounds[i].x;
    }
    return lastX;
  }

  /** Adds one complete alternating 720-pixel background segment. */
  addBackgroundSegment(x, segmentWidth) {
    const segmentNumber = Math.abs(x / segmentWidth) % 2 === 0 ? 1 : 2;
    const basePath = "./assets/img/5_hintergrund/layers/";
    this.world.level.backgroundObjects.push(
      new BackgroundObject(basePath + "air.png", x),
      new BackgroundObject(basePath + "3_third_layer/" + segmentNumber + ".png", x),
      new BackgroundObject(basePath + "2_second_layer/" + segmentNumber + ".png", x),
      new BackgroundObject(basePath + "1_first_layer/" + segmentNumber + ".png", x),
    );
  }

  /** Returns whether another configured level follows the current one. */
  shouldTransitionToNextLevel() {
    return this.world.currentLevel < Object.keys(LEVEL_CONFIGS).length;
  }

  /**
   * Finalizes the successful level and opens the transition to the next level.
   */
  completeLevel() {
    const world = this.world;
    world.stopAllGameProcesses();
    soundHub.stopBackgroundMusic();
    world.silenceAllAudio();
    world.addScore(world.gameStateManager.calculateVictoryBonus());
    world.gameOver = true;
    world.freezeWorld();
    this.openTransition();
  }

  /** Opens the static transition dialog for the following level. */
  openTransition() {
    const currentLevel = this.world.currentLevel;
    const nextLevel = currentLevel + 1;
    if (typeof showLevelTransition === "function") {
      showLevelTransition(currentLevel, nextLevel);
    }
  }
}
