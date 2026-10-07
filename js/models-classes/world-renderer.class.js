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
    this.drawBatFlight();
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

  /** Updates and draws the screen-space Bat flight attraction. */
  drawBatFlight() {
    const manager = this.world.batFlightManager;
    manager.update();
    if (!manager.isDrawable()) return;
    this.world.ctx.drawImage(
      manager.getCurrentImage(),
      manager.x,
      manager.y,
      manager.width,
      manager.height,
    );
  }

  /** Draws the temporary bottle pickup feedback above Pepe. */
  showBottlePickupEffect() {
    const world = this.world;
    this.startTemporaryFeedback(
      "+1",
      world.character.y - 50,
      30,
      "--color-effect-bottle-pickup",
    );
  }

  /** Draws temporary score feedback above Pepe. */
  showScoreFeedback(points) {
    const world = this.world;
    this.startTemporaryFeedback(
      "+" + points + " Pts",
      world.character.y - 80,
      25,
      "--color-text-light",
    );
  }

  /** Starts one fading text feedback effect at Pepe's current position. */
  startTemporaryFeedback(text, y, fontSize, colorVariable) {
    const world = this.world;
    const x = world.character.x + world.character.width / 2;
    const renderer = this;
    let opacity = 1;
    const interval = world.setManagedInterval(function () {
      opacity = renderer.drawTemporaryFeedback(
        text,
        x,
        y,
        fontSize,
        colorVariable,
        opacity,
      );
      if (opacity <= 0) world.clearManagedInterval(interval);
    }, 50);
  }

  /** Draws one feedback frame and returns the next opacity value. */
  drawTemporaryFeedback(text, x, y, fontSize, colorVariable, opacity) {
    const world = this.world;
    world.ctx.save();
    world.ctx.font = "bold " + fontSize + "px Zabars";
    world.ctx.globalAlpha = opacity;
    world.ctx.fillStyle = getGameColor(colorVariable);
    world.ctx.fillText(text, x - world.cameraX, y);
    world.ctx.restore();
    return opacity - 0.2;
  }

  /**
   * Draws active Game Over or Victory overlays.
   */
  drawTerminalOverlays() {
    const world = this.world;
    if (world.showCoffin) this.drawCoffin();
    if (world.showYouWin) this.drawVictoryBackground();
    if (world.showGameOver) this.drawGameOverScreen();
  }

  /**
   * Draws the rotating coffin and RIP label.
   */
  drawCoffin() {
    const centerX = this.world.canvas.width / 2;
    const centerY = this.world.canvas.height / 2;
    const coffinWidth = 250;
    const coffinHeight = 150;
    this.drawRotatingCoffin(centerX, centerY, coffinWidth, coffinHeight);
    this.drawCoffinLabel(centerX, centerY, coffinHeight);
  }

  /** Draws the coffin sprite with its current rotation. */
  drawRotatingCoffin(centerX, centerY, coffinWidth, coffinHeight) {
    const world = this.world;
    world.ctx.save();
    world.ctx.translate(centerX, centerY);
    world.ctx.rotate((world.coffinRotation * Math.PI) / 180);
    world.ctx.drawImage(
      world.coffinImg,
      -coffinWidth / 2,
      -coffinHeight / 2,
      coffinWidth,
      coffinHeight,
    );
    world.ctx.restore();
  }

  /** Draws the RIP label above the coffin. */
  drawCoffinLabel(centerX, centerY, coffinHeight) {
    const ctx = this.world.ctx;
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
    const renderer = this;
    objects.forEach(function (object) {
      renderer.addToMap(object);
    });
  }

  /**
   * Draws one object and mirrors it when required.
   *
   * @param {DrawableObject} movableObject - Object to draw.
   */
  addToMap(movableObject) {
    if (movableObject instanceof Character && movableObject.isSpecialJumping) {
      this.drawSpecialJumpCharacter(movableObject);
      return;
    }
    if (movableObject.otherDirection) {
      this.flipImage(movableObject);
      return;
    }
    movableObject.draw(this.world.ctx);
  }

  /** Draws Pepe rotated around his center during a Special Jump. */
  drawSpecialJumpCharacter(character) {
    const ctx = this.world.ctx;
    ctx.save();
    ctx.translate(character.x + character.width / 2,
      character.y + character.heigth / 2);
    ctx.rotate(character.specialJumpRotation);
    if (character.otherDirection) ctx.scale(-1, 1);
    ctx.drawImage(character.img, -character.width / 2,
      -character.heigth / 2, character.width, character.heigth);
    ctx.restore();
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
    const renderer = this;
    this.world.animationFrameId = requestAnimationFrame(function () {
      this.world.draw();
    });
  }
}
