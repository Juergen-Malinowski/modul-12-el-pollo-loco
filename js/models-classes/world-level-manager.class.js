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
    if (scale === 1) return;
    this.scaleEnemies(scale);
    this.scaleCollectibles(this.world.level.bottles, 200, scale);
    this.scaleCollectibles(this.world.level.coins, 300, scale);
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

  /** Returns whether the current implementation should open the next level. */
  shouldTransitionToNextLevel() {
    return this.world.currentLevel === 1;
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
