/**
 * Renders health, boss, bottle, and coin status information.
 */
class WorldStatusHudRenderer {
  constructor(world, hudRenderer) {
    this.world = world;
    this.hudRenderer = hudRenderer;
    this.bottleIcon = new Image();
    this.coinIcon = new Image();
    this.bottleIcon.src = "./assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png";
    this.coinIcon.src = "./assets/img/8_muenzen/coin_2.png";
  }

  /** Draws status bars and their numeric values. */
  drawStatusHud(mobileOverlayHud) {
    const world = this.world;
    this.setStatusBarLayout(mobileOverlayHud);
    world.addToMap(world.statusBar);
    world.addToMap(world.bossBar);
    this.drawSegmentedResourceBar(world.bottleBar, this.bottleIcon, "--color-status-bottle");
    this.drawSegmentedResourceBar(world.coinBar, this.coinIcon, "--color-status-coin");
    this.drawStatusValues(mobileOverlayHud);
  }

  /** Draws one icon-based resource bar with twenty five-percent segments. */
  drawSegmentedResourceBar(bar, icon, fillColor) {
    const layout = this.getSegmentedBarLayout(bar);
    const ctx = this.world.ctx;
    ctx.save();
    this.drawResourceIcon(ctx, icon, layout);
    this.drawResourceSegments(ctx, bar.percentage, layout, fillColor);
    ctx.restore();
  }

  /** Returns icon and segment geometry for one resource bar. */
  getSegmentedBarLayout(bar) {
    const iconSize = bar.heigth * 0.72;
    const segmentX = bar.x + iconSize + 5;
    return {
      iconX: bar.x,
      iconY: bar.y + (bar.heigth - iconSize) / 2,
      iconSize: iconSize,
      segmentX: segmentX,
      segmentY: bar.y + bar.heigth * 0.3,
      segmentWidth: bar.width - iconSize - 5,
      segmentHeight: bar.heigth * 0.4,
    };
  }

  /** Draws the Bottle or Coin icon beside its segmented bar. */
  drawResourceIcon(ctx, icon, layout) {
    if (!icon.complete) return;
    ctx.drawImage(
      icon,
      layout.iconX,
      layout.iconY,
      layout.iconSize,
      layout.iconSize,
    );
  }

  /** Draws twenty resource segments from the current percentage. */
  drawResourceSegments(ctx, percentage, layout, fillColor) {
    const segmentCount = 20;
    const gap = 1;
    const width = (layout.segmentWidth - gap * (segmentCount - 1)) / segmentCount;
    const filled = this.getFilledSegmentCount(percentage, segmentCount);
    for (let i = 0; i < segmentCount; i++) {
      this.drawResourceSegment(ctx, layout, width, gap, i, i < filled, fillColor);
    }
  }

  /** Returns the number of visible five-percent segments. */
  getFilledSegmentCount(percentage, segmentCount) {
    if (percentage <= 0) return 0;
    return Math.min(segmentCount, Math.ceil(percentage / 100 * segmentCount));
  }

  /** Draws one filled or empty resource segment. */
  drawResourceSegment(ctx, layout, width, gap, index, filled, fillColor) {
    const x = layout.segmentX + index * (width + gap);
    ctx.fillStyle = getGameColor(filled ? fillColor : "--color-status-empty");
    ctx.fillRect(x, layout.segmentY, width, layout.segmentHeight);
    ctx.strokeStyle = getGameColor("--color-border-dark");
    ctx.strokeRect(x, layout.segmentY, width, layout.segmentHeight);
  }

  /** Applies desktop or mobile status-bar positions. */
  setStatusBarLayout(mobileOverlayHud) {
    const world = this.world;
    const bars = [world.statusBar, world.bossBar, world.bottleBar, world.coinBar];
    if (!mobileOverlayHud) {
      this.setDesktopStatusBarLayout(bars);
      return;
    }
    this.setMobileStatusBarLayout(bars);
  }

  /** Places status bars in one responsive mobile row. */
  setMobileStatusBarLayout(bars) {
    const layout = this.hudRenderer.getMobileHudLayout();
    const canvasWidth = this.world.canvas.width;
    const gap =
      (canvasWidth - layout.edge * 2 - layout.barWidth * bars.length) /
      (bars.length - 1);
    for (let i = 0; i < bars.length; i++) {
      this.setMobileStatusBar(bars[i], layout, gap, i);
    }
  }

  /** Applies one calculated mobile status-bar position. */
  setMobileStatusBar(bar, layout, gap, index) {
    bar.x = layout.edge + index * (layout.barWidth + gap);
    bar.y = layout.barY;
    bar.width = layout.barWidth;
    bar.heigth = layout.barHeight;
  }

  /** Places status bars in the desktop layout. */
  setDesktopStatusBarLayout(bars) {
    const yPositions = [10, 70, 130, 190];
    for (let i = 0; i < bars.length; i++) {
      bars[i].x = 10;
      bars[i].y = yPositions[i];
      bars[i].width = 150;
      bars[i].heigth = 50;
    }
  }

  /** Draws the exact health, boss, bottle, and coin values. */
  drawStatusValues(mobileOverlayHud) {
    const world = this.world;
    world.ctx.save();
    this.prepareStatusValueContext(mobileOverlayHud);
    this.drawLifeValues(mobileOverlayHud);
    this.drawResourceValues(mobileOverlayHud);
    world.ctx.restore();
  }

  /** Applies shared typography for numeric status values. */
  prepareStatusValueContext(mobileOverlayHud) {
    const ctx = this.world.ctx;
    ctx.font = mobileOverlayHud ? "bold 28px Rye" : "bold 36px Rye";
    ctx.fillStyle = getGameColor("--color-text-light");
    ctx.textAlign = "left";
  }

  /** Draws Pepe and Endboss health values. */
  drawLifeValues(mobileOverlayHud) {
    const world = this.world;
    const healthPosition = this.getLifeValuePosition(world.statusBar, mobileOverlayHud);
    const bossPosition = this.getLifeValuePosition(world.bossBar, mobileOverlayHud);
    world.ctx.fillText(world.character.energie + "", healthPosition.x, healthPosition.y);
    world.ctx.fillText(this.getBossHealth() + "", bossPosition.x, bossPosition.y);
  }

  /** Draws bottle and coin counts. */
  drawResourceValues(mobileOverlayHud) {
    const world = this.world;
    const bottlePosition = this.getResourceValuePosition(world.bottleBar, mobileOverlayHud);
    const coinPosition = this.getResourceValuePosition(world.coinBar, mobileOverlayHud);
    world.ctx.fillText(world.collectedBottles + "", bottlePosition.x, bottlePosition.y);
    world.ctx.fillText(world.collectedCoins + "", coinPosition.x, coinPosition.y);
  }

  /** Returns the numeric position beside one life bar. */
  getLifeValuePosition(bar, mobileOverlayHud) {
    return {
      x: bar.x + bar.width + (mobileOverlayHud ? 5 : 15),
      y: bar.y + bar.heigth * (mobileOverlayHud ? 0.75 : 0.94),
    };
  }

  /** Returns the numeric position beside a segmented resource bar. */
  getResourceValuePosition(bar, mobileOverlayHud) {
    return {
      x: bar.x + bar.width + (mobileOverlayHud ? 5 : 15),
      y: bar.y + bar.heigth * (mobileOverlayHud ? 0.75 : 0.94),
    };
  }

  /** Returns the remaining Endboss health. */
  getBossHealth() {
    const enemies = this.world.level.enemies;
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i] instanceof Endboss) {
        return Math.max(0, enemies[i].energieBoss);
      }
    }
    return 0;
  }
}
