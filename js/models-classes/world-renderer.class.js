/**
 * Renders the World scene, terminal overlays, and movable objects.
 */
class WorldRenderer {
  constructor(world) {
    this.world = world;
  }

  /**
   * Draws one animation frame and schedules the next one.
   */
  draw() {
    const world = this.world;
    if (!world.isRunning) return;

    world.ctx.clearRect(0, 0, world.canvas.width, world.canvas.height);
    this.drawWorldLayer();
    const mobileOverlayHud = world.hudRenderer.isMobileOverlayHud();
    this.drawHudLayer(mobileOverlayHud);
    this.drawGameplayLayer();
    world.hudRenderer.drawSoundIcon(mobileOverlayHud);
    this.drawTerminalOverlays();
    this.scheduleNextFrame();
  }

  /**
   * Draws background objects in camera space.
   */
  drawWorldLayer() {
    const world = this.world;
    world.ctx.translate(world.cameraX, 0);
    this.addObjectsToMap(world.level.backgroundObjects);
    this.addObjectsToMap(world.level.clouds);
    world.ctx.translate(-world.cameraX, 0);
  }

  /**
   * Draws HUD elements outside camera space.
   *
   * @param {boolean} mobileOverlayHud - Whether touch controls overlap the stage.
   */
  drawHudLayer(mobileOverlayHud) {
    const world = this.world;
    world.hudRenderer.drawStatusHud(mobileOverlayHud);
    world.hudRenderer.drawScoreHud(mobileOverlayHud);
  }

  /**
   * Draws gameplay objects in camera space.
   */
  drawGameplayLayer() {
    const world = this.world;
    world.ctx.translate(world.cameraX, 0);
    this.addObjectsToMap(world.level.bottles);
    this.addObjectsToMap(world.level.coins);
    this.addToMap(world.character);
    this.addObjectsToMap(world.level.enemies);
    this.addObjectsToMap(world.throwableObjects);
    world.ctx.translate(-world.cameraX, 0);
  }

  /**
   * Draws active Game Over or Victory overlays.
   */
  drawTerminalOverlays() {
    const world = this.world;
    if (world.showCoffin) this.drawCoffin();
    if (world.showYouWin) this.drawVictoryBackground();
    if (world.showYouWin && world.showVictoryOptionsOverlay) {
      world.drawVictoryOptions(world.ctx);
    }
    if (world.showGameOver) this.drawGameOverScreen();
  }

  /**
   * Draws the rotating coffin and RIP label.
   */
  drawCoffin() {
    const world = this.world;
    const ctx = world.ctx;
    const centerX = world.canvas.width / 2;
    const centerY = world.canvas.height / 2;
    const coffinWidth = 250;
    const coffinHeight = 150;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((world.coffinRotation * Math.PI) / 180);
    ctx.drawImage(
      world.coffinImg,
      -coffinWidth / 2,
      -coffinHeight / 2,
      coffinWidth,
      coffinHeight,
    );
    ctx.restore();

    ctx.save();
    ctx.font = "bold 90px Zabars";
    ctx.fillStyle = getGameColor("--color-effect-bottle-pickup");
    ctx.textAlign = "center";
    ctx.fillText("R . i . P.", centerX, centerY - coffinHeight + 65);
    ctx.restore();
  }

  /**
   * Draws the full-canvas Victory background.
   */
  drawVictoryBackground() {
    const world = this.world;
    world.ctx.save();
    world.ctx.globalAlpha = 1.0;
    world.ctx.drawImage(
      world.youWinImg,
      0,
      0,
      world.canvas.width,
      world.canvas.height,
    );
    world.ctx.restore();
  }

  /**
   * Draws the Game Over background and its action buttons.
   */
  drawGameOverScreen() {
    this.drawGameOverBackground();
    this.ensureGameOverButtonAreas();
    this.drawGameOverButtons();
  }

  /**
   * Draws the full-canvas Game Over background.
   */
  drawGameOverBackground() {
    const world = this.world;
    world.ctx.save();
    world.ctx.globalAlpha = 1.0;
    world.ctx.drawImage(
      world.gameOverImg,
      0,
      0,
      world.canvas.width,
      world.canvas.height,
    );
    world.ctx.restore();
  }

  /**
   * Creates Game Over button areas if they are not available yet.
   */
  ensureGameOverButtonAreas() {
    const world = this.world;
    if (world.menuButtonArea && world.tryAgainButtonArea) return;

    const buttonWidth = 220;
    const buttonHeight = 60;
    const spacing = 40;
    const centerX = world.canvas.width / 2;
    const buttonY = Math.floor(world.canvas.height * 0.75);

    world.menuButtonArea = {
      x: centerX - buttonWidth - spacing,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
    };
    world.tryAgainButtonArea = {
      x: centerX + spacing,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
    };
  }

  /**
   * Draws the Game Over menu and retry buttons.
   */
  drawGameOverButtons() {
    const world = this.world;
    const ctx = world.ctx;

    ctx.save();
    ctx.lineWidth = 4;
    ctx.font = "bold 36px Zabars";
    ctx.letterSpacing = "2px";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    this.drawGameOverButton(ctx, world.menuButtonArea, "Menu");
    this.drawGameOverButton(ctx, world.tryAgainButtonArea, "Try again?");
    ctx.restore();
  }

  /**
   * Draws one Game Over action button.
   *
   * @param {CanvasRenderingContext2D} ctx - Game canvas context.
   * @param {object} area - Button rectangle.
   * @param {string} label - Button label.
   */
  drawGameOverButton(ctx, area, label) {
    ctx.fillStyle = getGameColor("--color-ui-primary");
    ctx.strokeStyle = getGameColor("--color-border-dark");
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.strokeRect(area.x, area.y, area.width, area.height);
    ctx.fillStyle = getGameColor("--color-text-dark");
    ctx.fillText(
      label,
      area.x + area.width / 2,
      area.y + area.height / 2,
    );
  }

  /**
   * Draws every object in a collection.
   *
   * @param {Array} objects - Drawable objects.
   */
  addObjectsToMap(objects) {
    objects.forEach((object) => this.addToMap(object));
  }

  /**
   * Draws one object and mirrors it when required.
   *
   * @param {DrawableObject} movableObject - Object to draw.
   */
  addToMap(movableObject) {
    if (movableObject.otherDirection) {
      this.flipImage(movableObject);
      return;
    }
    movableObject.draw(this.world.ctx);
  }

  /**
   * Draws one object mirrored around its vertical axis.
   *
   * @param {DrawableObject} movableObject - Object to mirror and draw.
   */
  flipImage(movableObject) {
    const ctx = this.world.ctx;
    ctx.save();
    ctx.translate(movableObject.x + movableObject.width, movableObject.y);
    ctx.scale(-1, 1);
    ctx.drawImage(
      movableObject.img,
      0,
      0,
      movableObject.width,
      movableObject.heigth,
    );
    ctx.restore();
  }

  /**
   * Schedules the next animation frame through World.
   */
  scheduleNextFrame() {
    this.world.animationFrameId = requestAnimationFrame(() => {
      this.world.draw();
    });
  }
}
