/**
 * Renders and positions the in-game HUD and handles its sound control.
 */
class WorldHudRenderer {
  constructor(world) {
    this.world = world;
    this.statusRenderer = new WorldStatusHudRenderer(world, this);
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
    this.statusRenderer.drawStatusHud(mobileOverlayHud);
  }

  /** Draws score and control hints. */
  drawScoreHud(mobileOverlayHud) {
    const world = this.world;
    if (!world.blinkActive || (world.blinkActive && world.blinkVisible)) {
      const layout = this.getScoreLayout(mobileOverlayHud);
      world.ctx.save();
      world.ctx.font = "bold " + layout.fontSize + "px Zabars";
      world.ctx.letterSpacing = "2px";
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
      const rightEdge = this.getRightAlignedGameControlHintsPosition().x;
      return { x: rightEdge, y: 22, fontSize: 40, textAlign: "right" };
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
    ctx.letterSpacing = "2px";
    const textWidth = ctx.measureText(text).width;
    ctx.restore();

    if (textWidth <= maxWidth) return fontSize;
    return Math.max(22, Math.floor(fontSize * (maxWidth / textWidth)));
  }

  /** Draws the gameplay control hints. */
  drawGameControlHints(ctx, mobileOverlayHud = false) {
    const mobileControlsActive = this.isMobileControlsActive();
    const position = this.getGameControlHintsPosition(mobileOverlayHud);
    const fontSize = mobileControlsActive ? 24 : 18;
    const lineHeight = 30;

    ctx.save();
    ctx.font = "bold " + fontSize + "px Zabars";
    ctx.letterSpacing = "2px";
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
    ctx.fillText("P  Pause / Resume", position.x, position.y + lineHeight * 4);
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
      "P  Pause / Resume",
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
    this.drawLevelIndicator(area, mobileOverlayHud);
    this.drawPauseButton(area);
  }

  /** Draws the visible pause indicator and resume button. */
  drawPauseButton(soundArea) {
    if (!this.world.isPaused) return;
    const area = this.getPauseButtonArea(soundArea);
    const ctx = this.world.ctx;
    ctx.save();
    ctx.fillStyle = getGameColor("--color-ui-primary");
    ctx.strokeStyle = getGameColor("--color-border-dark");
    ctx.lineWidth = 3;
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    ctx.font = "bold 28px Zabars";
    ctx.letterSpacing = "2px";
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PAUSED - RESUME", area.x + area.width / 2, area.y + area.height / 2);
    ctx.restore();
  }

  /** Returns the pause button area below the level indicator. */
  getPauseButtonArea(soundArea = this.getSoundIconArea()) {
    const width = 220;
    const height = 44;
    return {
      x: soundArea.x + soundArea.size / 2 - width / 2,
      y: soundArea.y + soundArea.size + 100,
      width: width,
      height: height,
    };
  }

  /**
   * Draws the active level below the sound icon using the Score style.
   */
  drawLevelIndicator(area, mobileOverlayHud) {
    const world = this.world;
    const scoreLayout = this.getScoreLayout(mobileOverlayHud);
    world.ctx.save();
    world.ctx.font = "bold " + scoreLayout.fontSize + "px Zabars";
    world.ctx.letterSpacing = "2px";
    world.ctx.fillStyle = getGameColor("--color-ui-primary");
    world.ctx.textAlign = "center";
    world.ctx.textBaseline = "top";
    world.ctx.fillText(
      world.levelConfig.label,
      area.x + area.size / 2,
      area.y + area.size + 8,
    );
    world.ctx.restore();
  }

  /**
   * Returns the sound-icon hit area for the current HUD layout.
   */
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

  /** Routes one canvas click to the active HUD controls. */
  handleHudClick(x, y) {
    if (this.handlePauseButtonClick(x, y)) return;
    this.handleSoundIconClick(x, y);
  }

  /** Resumes gameplay when the visible pause button is clicked. */
  handlePauseButtonClick(x, y) {
    if (!this.world.isPaused) return false;
    const area = this.getPauseButtonArea();
    if (!this.isPointInsideRect(x, y, area)) return false;
    this.world.togglePause();
    return true;
  }

  /** Checks whether a point lies inside a rectangular HUD area. */
  isPointInsideRect(x, y, area) {
    return x >= area.x && x <= area.x + area.width &&
      y >= area.y && y <= area.y + area.height;
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
