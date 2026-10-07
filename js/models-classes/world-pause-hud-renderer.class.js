/**
 * Renders and handles pause controls inside the Canvas HUD.
 */
class WorldPauseHudRenderer {
  constructor(world, hudRenderer) {
    this.world = world;
    this.hudRenderer = hudRenderer;
  }

  /** Draws the mobile pause control or the desktop resume button. */
  drawPauseButton(soundArea) {
    if (this.hudRenderer.isMobileControlsActive()) {
      this.drawMobilePauseButton(soundArea);
      return;
    }
    if (!this.world.isPaused) return;
    this.drawDesktopPauseButton(soundArea);
  }

  /** Draws the compact mobile pause or resume control. */
  drawMobilePauseButton(soundArea) {
    const area = this.getMobilePauseButtonArea(soundArea);
    const ctx = this.world.ctx;
    ctx.save();
    this.drawPauseButtonBackground(ctx, area);
    ctx.font = "bold 30px Smokum";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      this.world.isPaused ? "▶" : "Ⅱ",
      area.x + area.width / 2,
      area.y + area.height / 2,
    );
    ctx.restore();
  }

  /** Draws the large desktop resume control while gameplay is paused. */
  drawDesktopPauseButton(soundArea) {
    const area = this.getDesktopPauseButtonArea(soundArea);
    const ctx = this.world.ctx;
    ctx.save();
    this.drawPauseButtonBackground(ctx, area);
    ctx.font = "bold 28px Smokum";
    ctx.letterSpacing = "2px";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      "PAUSED - RESUME",
      area.x + area.width / 2,
      area.y + area.height / 2,
    );
    ctx.restore();
  }

  /** Draws the shared pause-button background and border. */
  drawPauseButtonBackground(ctx, area) {
    ctx.fillStyle = getGameColor("--color-ui-primary");
    ctx.strokeStyle = getGameColor("--color-border-dark");
    ctx.lineWidth = 3;
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.strokeRect(area.x, area.y, area.width, area.height);
  }

  /** Returns the active pause-button hit area. */
  getPauseButtonArea(soundArea) {
    if (this.hudRenderer.isMobileControlsActive()) {
      return this.getMobilePauseButtonArea(soundArea);
    }
    return this.getDesktopPauseButtonArea(soundArea);
  }

  /** Returns the compact mobile pause-button area beside the sound icon. */
  getMobilePauseButtonArea(soundArea) {
    const width = 42;
    const height = 38;
    return {
      x: soundArea.x + soundArea.size + 12,
      y: soundArea.y + (soundArea.size - height) / 2,
      width: width,
      height: height,
    };
  }

  /** Returns the desktop resume-button area below the level indicator. */
  getDesktopPauseButtonArea(soundArea) {
    const width = 220;
    const height = 44;
    return {
      x: soundArea.x + soundArea.size / 2 - width / 2,
      y: soundArea.y + soundArea.size + 100,
      width: width,
      height: height,
    };
  }

  /** Toggles pause when the active Canvas pause control is clicked. */
  handlePauseButtonClick(x, y) {
    const mobilePauseAvailable = this.hudRenderer.isMobileControlsActive();
    if (!mobilePauseAvailable && !this.world.isPaused) return false;
    const soundArea = this.hudRenderer.getSoundIconArea();
    const area = this.getPauseButtonArea(soundArea);
    if (!this.isPointInsideRect(x, y, area)) return false;
    this.world.togglePause();
    return true;
  }

  /** Checks whether a point lies inside a rectangular HUD area. */
  isPointInsideRect(x, y, area) {
    return x >= area.x && x <= area.x + area.width &&
      y >= area.y && y <= area.y + area.height;
  }
}
