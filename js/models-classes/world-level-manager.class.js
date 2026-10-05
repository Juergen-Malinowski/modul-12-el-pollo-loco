/**
 * Applies level-specific world setup and coordinates successful level transitions.
 */
class WorldLevelManager {
  constructor(world) {
    this.world = world;
  }

  /** Completes level-specific setup after the World has been created. */
  applyLevelSetup() {
    this.extendBackgroundToLevelEnd();
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
    if (world.gameStateManager.isPlayerDefeated()) return;
    world.stopAllGameProcesses();
    soundHub.stopBackgroundMusic();
    world.silenceAllAudio();
    storeBottleCarryover(world.collectedBottles);
    world.addScore(world.gameStateManager.calculateVictoryBonus());
    world.gameOver = true;
    world.freezeWorld();
    this.openTransition();
  }

  /** Opens the static transition dialog for the following level. */
  openTransition() {
    if (this.world.gameStateManager.isPlayerDefeated()) return;
    const currentLevel = this.world.currentLevel;
    const nextLevel = currentLevel + 1;
    if (typeof showLevelTransition === "function") {
      showLevelTransition(currentLevel, nextLevel);
    }
  }
}
