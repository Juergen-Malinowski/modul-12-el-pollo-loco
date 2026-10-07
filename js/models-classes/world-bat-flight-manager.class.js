/**
 * Controls the screen-space Bat attraction and its animated flight path.
 */
class WorldBatFlightManager {
  constructor(world) {
    this.world = world;
    this.width = BAT_FLIGHT_CONFIG.width;
    this.height = BAT_FLIGHT_CONFIG.height;
    this.isActive = false;
    this.x = 0;
    this.y = BAT_FLIGHT_CONFIG.startY;
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.lastUpdateTime = null;
    this.images = this.loadImages();
  }

  /** Loads the four-frame flight sequence from three Bat sprites. */
  loadImages() {
    const middle = this.createImage("./assets/img/flying_bat/bat_mid.webp");
    const up = this.createImage("./assets/img/flying_bat/bat_up.webp");
    const down = this.createImage("./assets/img/flying_bat/bat_down.webp");
    return [middle, up, middle, down];
  }

  /** Creates one Bat image resource. */
  createImage(path) {
    const image = new Image();
    image.src = path;
    return image;
  }

  /** Starts a Bat flight unless another one is already active. */
  startFlight() {
    if (this.isActive) return false;
    this.isActive = true;
    this.x = this.world.canvas.width;
    this.y = BAT_FLIGHT_CONFIG.startY;
    this.frameIndex = 0;
    this.frameElapsed = 0;
    this.lastUpdateTime = null;
    soundHub.playEffect(soundHub.soundBat);
    return true;
  }

  /** Advances flight position and sprite animation for the current frame. */
  update() {
    if (!this.isActive) return;
    const now = performance.now();
    if (this.world.isPaused) {
      this.lastUpdateTime = now;
      return;
    }
    if (this.lastUpdateTime === null) {
      this.lastUpdateTime = now;
      return;
    }
    const deltaSeconds = Math.min((now - this.lastUpdateTime) / 1000, 0.05);
    this.lastUpdateTime = now;
    this.updatePosition(deltaSeconds);
    this.updateAnimation(deltaSeconds * 1000);
    if (this.x <= -this.width) this.finishFlight();
  }

  /** Moves the Bat left while accelerating into and out of the dive. */
  updatePosition(deltaSeconds) {
    const progress = this.getProgress();
    const speed = BAT_FLIGHT_CONFIG.baseSpeed *
      this.getSpeedMultiplier(progress);
    this.x -= speed * deltaSeconds;
    this.y = this.getFlightY(this.getProgress());
  }

  /** Returns normalized horizontal progress from right entry to left exit. */
  getProgress() {
    const startX = this.world.canvas.width;
    const travelDistance = startX + this.width;
    const progress = (startX - this.x) / travelDistance;
    return Math.max(0, Math.min(1, progress));
  }

  /** Returns a speed multiplier rising to 150 percent at the dive midpoint. */
  getSpeedMultiplier(progress) {
    const peak = BAT_FLIGHT_CONFIG.maxSpeedMultiplier;
    const phase = 1 - Math.abs(progress * 2 - 1);
    return 1 + (peak - 1) * phase;
  }

  /** Returns the smooth dive height with its lowest point above Pepe's visible head. */
  getFlightY(progress) {
    const config = BAT_FLIGHT_CONFIG;
    const headY = this.getStandingPepeHeadY();
    const lowestY = Math.max(
      config.startY,
      headY - config.characterGap - this.height,
    );
    return config.startY +
      (lowestY - config.startY) * Math.sin(Math.PI * progress);
  }

  /** Returns Pepe's visible head height while he stands on the ground. */
  getStandingPepeHeadY() {
    const character = this.world.character;
    const visibleTopOffset = character.offset ? character.offset.top : 0;
    return 130 + visibleTopOffset;
  }

  /** Advances the mid-up-mid-down wing animation. */
  updateAnimation(deltaMilliseconds) {
    this.frameElapsed += deltaMilliseconds;
    if (this.frameElapsed < BAT_FLIGHT_CONFIG.frameDuration) return;
    this.frameElapsed -= BAT_FLIGHT_CONFIG.frameDuration;
    this.frameIndex = (this.frameIndex + 1) % this.images.length;
  }

  /** Returns whether the current sprite can safely be drawn. */
  isDrawable() {
    const image = this.getCurrentImage();
    return this.isActive && image && image.complete && image.naturalWidth > 0;
  }

  /** Returns the current Bat animation sprite. */
  getCurrentImage() {
    return this.images[this.frameIndex];
  }

  /** Ends the visual flight without interrupting the one-shot Bat sound. */
  finishFlight() {
    this.isActive = false;
    this.lastUpdateTime = null;
  }
}
