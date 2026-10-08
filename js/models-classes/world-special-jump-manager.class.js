/**
 * Controls Pepe's Special Jump during an active Endboss fight.
 */
class WorldSpecialJumpManager {
  doublePressWindowMs = 500;
  distanceSpriteFactor = 2;
  minimumBossGap = 100;
  durationMs = 2200;
  updateIntervalMs = 20;
  arcHeight = 260;
  lastJumpPress = 0;
  intervalId = null;

  /**
   * Creates the Special Jump manager for one World.
   *
   * @param {World} world - Owning game World.
   */
  constructor(world) {
    this.world = world;
  }

  /** Registers one physical Jump press and detects the configured double press. */
  registerJumpPress() {
    const character = this.world.character;
    if (character.isSpecialJumping) {
      this.world.keyboard.SPACE = false;
      return;
    }
    const now = Date.now();
    const isDoublePress = this.isDoublePress(now);
    this.lastJumpPress = now;
    if (!isDoublePress) return;
    this.lastJumpPress = 0;
    if (this.canStart()) this.start();
  }

  /** Returns whether the second Jump press arrived within 500 milliseconds. */
  isDoublePress(now) {
    return this.lastJumpPress > 0 &&
      now - this.lastJumpPress <= this.doublePressWindowMs;
  }

  /** Checks whether an active boss fight permits the Special Jump. */
  canStart() {
    const boss = this.getBoss();
    const character = this.world.character;
    return !!(boss && boss.isAlerted && !boss.isDeadBoss &&
      !character.isBossKnockback && !this.world.gameOver &&
      !this.world.playerDefeated);
  }

  /** Returns the active Endboss. */
  getBoss() {
    const enemies = this.world.level.enemies;
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i] instanceof Endboss) return enemies[i];
    }
    return null;
  }

  /** Starts the long escape arc away from the Endboss. */
  start() {
    const boss = this.getBoss();
    if (!boss) return;
    this.prepareTrajectory(boss);
    this.prepareCharacter();
    if (typeof soundHub.playSpecialJump === "function") {
      soundHub.playSpecialJump();
    }
    this.startMovementLoop();
  }

  /** Stores the complete path geometry before the jump begins. */
  prepareTrajectory(boss) {
    const character = this.world.character;
    this.startX = character.x;
    this.startY = character.y;
    this.groundY = 130;
    this.direction = this.getEscapeDirection(boss);
    this.edgeX = this.direction > 0 ?
      character.getRightBoundary() : character.getLeftBoundary();
    this.distanceToEdge = Math.abs(this.edgeX - this.startX);
    this.maximumDistance = boss.chargeDistance +
      character.width * this.distanceSpriteFactor;
    this.hasBounce = this.maximumDistance > this.distanceToEdge;
    this.travelDistance = this.resolveTravelDistance(boss);
    this.elapsedMs = 0;
  }

  /** Prepares Pepe for manager-controlled flight without normal gravity. */
  prepareCharacter() {
    const character = this.world.character;
    this.previousAcceleration = character.acceleration;
    character.acceleration = 0;
    character.speedY = 0;
    character.isSpecialJumping = true;
    character.isBossJumpAttack = false;
    character.specialJumpRotation = 0;
    this.world.keyboard.SPACE = false;
    soundHub.stopSnoring();
  }

  /** Returns the horizontal direction directly away from the boss. */
  getEscapeDirection(boss) {
    const character = this.world.character;
    const characterCenter = character.x + character.width / 2;
    const bossCenter = boss.x + boss.width / 2;
    if (characterCenter < bossCenter) return -1;
    if (characterCenter > bossCenter) return 1;
    return character.otherDirection ? -1 : 1;
  }

  /** Keeps a bounced landing behind the boss without extending total range. */
  resolveTravelDistance(boss) {
    if (!this.hasBounce) return this.maximumDistance;
    const safeX = this.getSafeLandingX(boss, -this.direction);
    const needed = this.distanceToEdge + Math.abs(this.edgeX - safeX);
    return Math.min(this.maximumDistance, needed);
  }

  /** Returns a boundary-safe landing point with 100 pixels of boss clearance. */
  getSafeLandingX(boss, side) {
    const character = this.world.character;
    let x = this.getRawSafeLandingX(boss, side);
    x = Math.max(character.getLeftBoundary(), x);
    return Math.min(character.getRightBoundary(), x);
  }

  /** Calculates the safe landing point from both collision-box edges. */
  getRawSafeLandingX(boss, side) {
    const character = this.world.character;
    if (side < 0) {
      const bossLeft = boss.x + boss.offset.left;
      return bossLeft - this.minimumBossGap -
        (character.width - character.offset.right);
    }
    const bossRight = boss.x + boss.width - boss.offset.right;
    return bossRight + this.minimumBossGap - character.offset.left;
  }

  /** Starts the pause-aware Special Jump update loop. */
  startMovementLoop() {
    const manager = this;
    this.clearMovementLoop();
    this.intervalId = this.world.setManagedInterval(function () {
      manager.update();
    }, this.updateIntervalMs);
  }

  /** Advances one Special Jump frame. */
  update() {
    const character = this.world.character;
    if (!character.isSpecialJumping || character.isDead() ||
      this.world.gameOver) {
      this.cancel();
      return;
    }
    this.elapsedMs += this.updateIntervalMs;
    const progress = Math.min(1, this.elapsedMs / this.durationMs);
    const oldX = character.x;
    const oldY = character.y;
    character.x = this.getX(progress);
    character.y = this.getY(progress);
    this.updateRotation(oldX, oldY, progress);
    character.updateCameraPosition();
    if (progress >= 1) this.finish();
  }

  /** Returns the horizontal position, including an optional edge reflection. */
  getX(progress) {
    const traveled = this.travelDistance * progress;
    if (!this.hasBounce || traveled <= this.distanceToEdge) {
      return this.startX + this.direction * traveled;
    }
    return this.edgeX -
      this.direction * (traveled - this.distanceToEdge);
  }

  /** Returns the vertical position on the long Special Jump curve. */
  getY(progress) {
    const apexY = Math.min(this.startY, this.groundY) - this.arcHeight;
    if (progress <= 0.5) {
      const phase = progress * 2;
      return this.startY + (apexY - this.startY) *
        Math.sin(phase * Math.PI / 2);
    }
    const phase = (progress - 0.5) * 2;
    return apexY + (this.groundY - apexY) *
      (1 - Math.cos(phase * Math.PI / 2));
  }

  /** Rotates Pepe head-first on ascent and feet-first on descent. */
  updateRotation(oldX, oldY, progress) {
    const character = this.world.character;
    const deltaX = character.x - oldX;
    const deltaY = character.y - oldY;
    if (Math.abs(deltaX) + Math.abs(deltaY) < 0.01) return;
    character.otherDirection = deltaX < 0;
    const angle = this.getCurveRotation(deltaX, deltaY, progress);
    character.specialJumpRotation = angle * this.getRotationBlend(progress);
  }

  /** Returns the body angle matching the current curve direction. */
  getCurveRotation(deltaX, deltaY, progress) {
    const tangent = Math.atan2(deltaY, deltaX);
    const angle = progress < 0.5 ?
      tangent + Math.PI / 2 : tangent - Math.PI / 2;
    return this.normalizeAngle(angle);
  }

  /** Keeps Pepe upright near the apex and during the last 20 percent. */
  getRotationBlend(progress) {
    if (progress < 0.4) return 1;
    if (progress < 0.5) return (0.5 - progress) / 0.1;
    if (progress < 0.6) return (progress - 0.5) / 0.1;
    if (progress < 0.8) return 1;
    return (1 - progress) / 0.2;
  }

  /** Normalizes rotation to the shortest signed angle. */
  normalizeAngle(angle) {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  }

  /** Finishes flight, restores gravity, and checks only the landing point. */
  finish() {
    const character = this.world.character;
    this.clearMovementLoop();
    character.y = this.groundY;
    this.ensureMinimumBossGap();
    this.restoreCharacter();
    if (this.world.stompComboManager) this.world.stompComboManager.reset();
    this.resolveChickenLanding();
  }

  /** Enforces the minimum boss gap without extending the configured range. */
  ensureMinimumBossGap() {
    const boss = this.getBoss();
    if (!boss || this.getBossGap(boss) >= this.minimumBossGap) return;
    const safeX = this.getSafeLandingX(boss,
      this.hasBounce ? -this.direction : this.direction);
    if (this.getTraveledDistanceTo(safeX) <= this.maximumDistance) {
      this.world.character.x = safeX;
    }
  }

  /** Returns total reflected-path distance needed to reach one X coordinate. */
  getTraveledDistanceTo(x) {
    if (!this.hasBounce) return Math.abs(x - this.startX);
    return this.distanceToEdge + Math.abs(this.edgeX - x);
  }

  /** Returns current free horizontal space between Pepe and the boss. */
  getBossGap(boss) {
    const character = this.world.character;
    const left = character.x + character.offset.left;
    const right = character.x + character.width - character.offset.right;
    const bossLeft = boss.x + boss.offset.left;
    const bossRight = boss.x + boss.width - boss.offset.right;
    if (right <= bossLeft) return bossLeft - right;
    if (left >= bossRight) return left - bossRight;
    return 0;
  }

  /** Restores normal Character physics and visual orientation. */
  restoreCharacter() {
    const character = this.world.character;
    character.acceleration = this.previousAcceleration || 4;
    character.speedY = 0;
    character.isSpecialJumping = false;
    character.isBossJumpAttack = false;
    character.specialJumpRotation = 0;
    this.lastJumpPress = 0;
  }

  /** Counts only an accidental final landing on a Chicken as a stomp hit. */
  resolveChickenLanding() {
    const enemies = this.world.level.enemies;
    const character = this.world.character;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (enemy instanceof Endboss || enemy.isDeadChicken) continue;
      if (!character.isColliding(enemy)) continue;
      this.world.collisionManager.handleChickenStomp(enemy);
      return;
    }
  }

  /** Cancels active Special Jump flight and restores normal physics. */
  cancel() {
    this.clearMovementLoop();
    if (this.world.character.isSpecialJumping) this.restoreCharacter();
    this.lastJumpPress = 0;
  }

  /** Stops the manager-owned movement interval. */
  clearMovementLoop() {
    if (this.intervalId === null) return;
    this.world.clearManagedInterval(this.intervalId);
    this.intervalId = null;
  }
}
