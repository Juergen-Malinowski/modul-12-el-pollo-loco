/**
 * Renders and positions the in-game HUD and handles its sound control.
 */
class WorldHudRenderer {
  constructor(world) {
    this.world = world;
  }

  /** Checks whether mobile controls currently overlap the game stage. */
  isMobileOverlayHud() {
    const controls = document.getElementById("mobileControls");
    return (
      this.isMobileControlsActive() &&
      controls.classList.contains("controlsOverlayStage")
    );
  }

  /** Draws status bars and their numeric values. */
  drawStatusHud(mobileOverlayHud) {
    const world = this.world;
    this.setStatusBarLayout(mobileOverlayHud);
    world.addToMap(world.statusBar);
    world.addToMap(world.bottleBar);
    world.addToMap(world.coinBar);
    world.addToMap(world.bossBar);
    this.drawStatusValues(mobileOverlayHud);
  }

  /** Returns the shared mobile HUD dimensions. */
  getMobileHudLayout() {
    const edge = 10;
    const barWidth = 140;
    const barHeight = 46;
    const rowTop = 6;
    const rowHeight = 54;
    return {
      edge: edge,
      barWidth: barWidth,
      barHeight: barHeight,
      barY: rowTop + (rowHeight - barHeight) / 2,
      bottom: rowTop + rowHeight,
    };
  }

  /** Applies desktop or mobile status-bar positions. */
  setStatusBarLayout(mobileOverlayHud) {
    const world = this.world;
    const bars = [world.statusBar, world.bottleBar, world.coinBar, world.bossBar];
    if (!mobileOverlayHud) {
      this.setDesktopStatusBarLayout(bars);
      return;
    }
    this.setMobileStatusBarLayout(bars);
  }

  /** Places status bars in one responsive mobile row. */
  setMobileStatusBarLayout(bars) {
    const layout = this.getMobileHudLayout();
    const canvasWidth = this.world.canvas.width;
    const gap =
      (canvasWidth - layout.edge * 2 - layout.barWidth * bars.length) /
      (bars.length - 1);

    for (let i = 0; i < bars.length; i++) {
      bars[i].x = layout.edge + i * (layout.barWidth + gap);
      bars[i].y = layout.barY;
      bars[i].width = layout.barWidth;
      bars[i].heigth = layout.barHeight;
    }
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

  /** Draws collected bottle and coin values. */
  drawStatusValues(mobileOverlayHud) {
    const world = this.world;
    world.ctx.save();
    world.ctx.font = mobileOverlayHud ? "bold 28px Zabars" : "bold 36px Zabars";
    world.ctx.fillStyle = getGameColor("--color-text-light");
    world.ctx.textAlign = "left";
    const bottlePosition = this.getBottleValuePosition(mobileOverlayHud);
    const coinPosition = this.getCoinValuePosition(mobileOverlayHud);
    world.ctx.fillText(world.collectedBottles + "", bottlePosition.x, bottlePosition.y);
    world.ctx.fillText(world.collectedCoins + "", coinPosition.x, coinPosition.y);
    world.ctx.restore();
  }

  /** Returns the bottle counter position. */
  getBottleValuePosition(mobileOverlayHud) {
    const bottleBar = this.world.bottleBar;
    if (!mobileOverlayHud) return { x: 175, y: 117 };
    return {
      x: bottleBar.x + bottleBar.width + 5,
      y: bottleBar.y + bottleBar.heigth * 0.75,
    };
  }

  /** Returns the coin counter position. */
  getCoinValuePosition(mobileOverlayHud) {
    const coinBar = this.world.coinBar;
    if (!mobileOverlayHud) return { x: 175, y: 175 };
    return {
      x: coinBar.x + coinBar.width + 5,
      y: coinBar.y + coinBar.heigth * 0.75,
    };
  }

  /** Draws score and control hints. */
  drawScoreHud(mobileOverlayHud) {
    const world = this.world;
    if (!world.blinkActive || (world.blinkActive && world.blinkVisible)) {
      const layout = this.getScoreLayout(mobileOverlayHud);
      world.ctx.save();
      world.ctx.font = "bold " + layout.fontSize + "px Zabars";
      world.ctx.fillStyle = getGameColor("--color-ui-primary");
      world.ctx.textAlign = layout.textAlign;
      world.ctx.textBaseline = "top";
      world.ctx.fillText("Score: " + world.score, layout.x, layout.y);
      world.ctx.restore();
    }
    this.drawGameControlHints(world.ctx, mobileOverlayHud);
  }

  /** Returns responsive score positioning and font size. */
  getScoreLayout(mobileOverlayHud) {
    if (!mobileOverlayHud) {
      return { x: 570, y: 22, fontSize: 40, textAlign: "left" };
    }

    const hintPosition = this.getGameControlHintsPosition(true);
    const hintLeft = this.getGameControlHintsLeftEdge(hintPosition.x);
    const centerX = this.world.canvas.width / 2;
    const maxWidth = Math.max(100, (hintLeft - centerX - 12) * 2);

    return {
      x: centerX,
      y: hintPosition.y,
      fontSize: this.getScoreFontSize("Score: " + this.world.score, maxWidth),
      textAlign: "center",
    };
  }

  /** Scales score text to the available width. */
  getScoreFontSize(text, maxWidth) {
    const ctx = this.world.ctx;
    const fontSize = 32;
    ctx.save();
    ctx.font = "bold " + fontSize + "px Zabars";
    const textWidth = ctx.measureText(text).width;
    ctx.restore();

    if (textWidth <= maxWidth) return fontSize;
    return Math.max(22, Math.floor(fontSize * (maxWidth / textWidth)));
  }

  /** Draws the gameplay control hints. */
  drawGameControlHints(ctx, mobileOverlayHud = false) {
    const mobileControlsActive = this.isMobileControlsActive();
    const position = this.getGameControlHintsPosition(mobileOverlayHud);
    const fontSize = mobileControlsActive ? 24 : 16;
    const lineHeight = 30;

    ctx.save();
    ctx.font = "bold " + fontSize + "px Zabars";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    this.drawGameControlHintLines(ctx, position, lineHeight);
    ctx.restore();
  }

  /** Draws the individual control-hint lines. */
  drawGameControlHintLines(ctx, position, lineHeight) {
    ctx.fillText("⬅  Move left", position.x, position.y);
    ctx.fillText("➡  Move right", position.x, position.y + lineHeight);
    ctx.fillText(
      "SHIFT  or  ⬆  Throw bottle",
      position.x,
      position.y + lineHeight * 2,
    );
    ctx.fillText("SPACE  Jump", position.x, position.y + lineHeight * 3);
  }

  /** Checks whether landscape touch controls are active. */
  isMobileControlsActive() {
    const controls = document.getElementById("mobileControls");
    return (
      controls &&
      controls.classList.contains("isActive") &&
      controls.classList.contains("touchControlsEnabled") &&
      window.matchMedia("(orientation: landscape)").matches
    );
  }

  /**
   * Resolves the control-hint anchor for the current HUD layout.
   *
   * @param {boolean} mobileOverlayHud - Whether touch controls overlap the stage.
   * @returns {{x: number, y: number}} Canvas coordinates for right-aligned hints.
   */
  getGameControlHintsPosition(mobileOverlayHud) {
    if (mobileOverlayHud) return this.getOverlayGameControlHintsPosition();
    return this.getRightAlignedGameControlHintsPosition();
  }

  /**
   * Keeps desktop and outside-stage control hints 20 CSS pixels from the stage edge.
   *
   * @returns {{x: number, y: number}} Canvas coordinates for the hint anchor.
   */
  getRightAlignedGameControlHintsPosition() {
    const stage = document.getElementById("gameStage");
    if (!stage) return { x: this.world.canvas.width - 20, y: 70 };

    const stageRect = stage.getBoundingClientRect();
    const scaleX = this.world.canvas.width / stageRect.width;
    return { x: this.world.canvas.width - 20 * scaleX, y: 70 };
  }

  /** Returns the control-hint position for overlay controls. */
  getOverlayGameControlHintsPosition() {
    const stage = document.getElementById("gameStage");
    const rightControls = document.querySelector("#mobileControls .rightControls");
    const layout = this.getMobileHudLayout();
    if (!stage || !rightControls) return { x: 620, y: layout.bottom + 18 };

    return this.calculateOverlayHintPosition(stage, rightControls, layout);
  }

  /** Calculates control-hint coordinates from rendered control bounds. */
  calculateOverlayHintPosition(stage, rightControls, layout) {
    const stageRect = stage.getBoundingClientRect();
    const controlRect = rightControls.getBoundingClientRect();
    const touchExtension = this.getMobileTouchInwardExtension();
    const scaleX = this.world.canvas.width / stageRect.width;
    const scaleY = this.world.canvas.height / stageRect.height;

    return {
      x: Math.max(
        120,
        (controlRect.left - touchExtension - 20 - stageRect.left) * scaleX,
      ),
      y: layout.bottom + 12 * scaleY,
    };
  }

  /** Reads the configured inward touch-control extension. */
  getMobileTouchInwardExtension() {
    const controls = document.getElementById("mobileControls");
    if (!controls) return 0;

    const value = getComputedStyle(controls).getPropertyValue(
      "--touch-inward-extension",
    );
    return parseFloat(value) || 0;
  }

  /** Calculates the left edge of right-aligned control hints. */
  getGameControlHintsLeftEdge(rightEdge) {
    const lines = [
      "⬅  Move left",
      "➡  Move right",
      "SHIFT  or  ⬆  Throw bottle",
      "SPACE  Jump",
    ];
    const fontSize = this.isMobileControlsActive() ? 24 : 16;
    const ctx = this.world.ctx;

    ctx.save();
    ctx.font = "bold " + fontSize + "px Zabars";
    const maxWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    ctx.restore();

    return rightEdge - maxWidth;
  }

  /** Draws the sound icon for the current HUD layout. */
  drawSoundIcon(mobileOverlayHud) {
    const world = this.world;
    const area = this.getSoundIconArea(mobileOverlayHud);
    world.ctx.save();
    world.ctx.font = "70px Zabars";
    world.ctx.textAlign = "center";
    world.ctx.textBaseline = "middle";
    world.ctx.fillStyle = getGameColor("--color-text-light");
    world.ctx.fillText(
      soundHub.isMuted ? "🔇" : "🔊",
      area.x + area.size / 2,
      area.y + area.size / 2,
    );
    world.ctx.restore();
  }

  getSoundIconArea(mobileOverlayHud = this.isMobileOverlayHud()) {
    const iconSize = 80;
    if (!mobileOverlayHud) {
      return {
        x: (this.world.canvas.width - iconSize) / 2,
        y: 20,
        size: iconSize,
      };
    }
    return this.getMobileSoundIconArea(iconSize);
  }

  /** Returns the mobile sound-icon hit area. */
  getMobileSoundIconArea(iconSize) {
    const stage = document.getElementById("gameStage");
    const leftControls = document.querySelector("#mobileControls .leftControls");
    const layout = this.getMobileHudLayout();
    if (!stage || !leftControls) {
      return { x: 90, y: layout.bottom + 18, size: iconSize };
    }

    return this.calculateMobileSoundIconArea(
      iconSize,
      stage,
      leftControls,
      layout,
    );
  }

  /** Calculates mobile sound-icon coordinates. */
  calculateMobileSoundIconArea(iconSize, stage, leftControls, layout) {
    const stageRect = stage.getBoundingClientRect();
    const controlRect = leftControls.getBoundingClientRect();
    const touchExtension = this.getMobileTouchInwardExtension();
    const scaleX = this.world.canvas.width / stageRect.width;
    const scaleY = this.world.canvas.height / stageRect.height;
    const x =
      (controlRect.right + touchExtension + 20 - stageRect.left) * scaleX;
    const y = layout.bottom + 12 * scaleY;

    return {
      x: Math.max(8, Math.min(x, this.world.canvas.width - iconSize - 8)),
      y: y,
      size: iconSize,
    };
  }

  /** Handles clicks inside the sound-icon area. */
  handleSoundIconClick(x, y) {
    const area = this.getSoundIconArea();
    if (!this.isPointInsideArea(x, y, area)) return;
    this.toggleSound();
  }

  /** Checks whether a point lies inside a square HUD area. */
  isPointInsideArea(x, y, area) {
    return (
      x >= area.x &&
      x <= area.x + area.size &&
      y >= area.y &&
      y <= area.y + area.size
    );
  }

  /** Toggles mute state and synchronizes audio UI. */
  toggleSound() {
    if (
      typeof soundHub === "undefined" ||
      !soundHub ||
      typeof soundHub.toggleMute !== "function"
    ) {
      return;
    }

    const wasMuted = soundHub.isMuted;
    soundHub.toggleMute();
    this.resumeMusicAfterUnmute(wasMuted);
    if (typeof syncAudioUIFromSoundHub === "function") syncAudioUIFromSoundHub();
  }

  /** Restarts background music after unmuting when appropriate. */
  resumeMusicAfterUnmute(wasMuted) {
    if (
      wasMuted &&
      !soundHub.isMuted &&
      typeof soundHub.playBackgroundMusic === "function"
    ) {
      soundHub.playBackgroundMusic();
    }
  }
}
