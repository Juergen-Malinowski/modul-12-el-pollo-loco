/**
 * Handles collisions, collectible pickups, and projectile hits for one World.
 */
class WorldCollisionManager {
  constructor(world) {
    this.world = world;
  }

  /**
   * Resolves all collision groups for the current game tick.
   */
  checkCollisions() {
    if (this.world.gameOver) return;
    this.checkEnemyCollisions();
    this.checkBottlePickups();
    this.checkCoinPickups();
    this.checkBottleEnemyHits();
    this.checkBottleBossHits();
  }

  /** Checks all enemy collisions for the current tick. */
  checkEnemyCollisions() {
    for (let i = this.world.level.enemies.length - 1; i >= 0; i--) {
      this.handleEnemyCollision(this.world.level.enemies[i]);
    }
  }

  /** Resolves one enemy collision with the Character. */
  handleEnemyCollision(enemy) {
    if (!this.world.character.isColliding(enemy)) return;
    if (this.isStompCollision(enemy) && this.resolveStompCollision(enemy)) return;
    if (!enemy.isDeadChicken) this.damageCharacter();
  }

  /** Checks whether the Character lands on an enemy from above. */
  isStompCollision(enemy) {
    const character = this.world.character;
    const characterBottom =
      character.y +
      character.heigth -
      (character.offset ? character.offset.buttom : 0);
    const isFalling = character.speedY < 5;
    const isAboveEnemy = characterBottom <= enemy.y + enemy.heigth * 0.7;
    return isFalling && isAboveEnemy && !enemy.isDeadChicken;
  }

  /** Routes a stomp to normal-enemy or Endboss handling. */
  resolveStompCollision(enemy) {
    if (!(enemy instanceof Endboss)) {
      this.handleChickenStomp(enemy);
      return true;
    }
    if (!enemy.isDeadBoss) {
      this.handleBossStomp(enemy);
      return true;
    }
    return false;
  }

  /** Resolves a stomp on a normal chicken enemy. */
  handleChickenStomp(enemy) {
    const world = this.world;
    world.character.speedY = 25;
    world.character.y =
      enemy.y + (enemy.offset ? enemy.offset.top : 0) - world.character.heigth;
    soundHub.playEffect(soundHub.soundChickenHit);
    enemy.die();
    world.addScore(enemy instanceof LittleChicken ? 15 : 20);
    this.removeEnemyLater(enemy);
    soundHub.playEffect(soundHub.soundChickenMud);
  }

  /** Schedules removal of a defeated enemy. */
  removeEnemyLater(enemy) {
    this.world.setManagedTimeout(() => {
      const index = this.world.level.enemies.indexOf(enemy);
      if (index > -1) this.world.level.enemies.splice(index, 1);
    }, 2000);
  }

  /** Applies damage and bounce behavior for an Endboss stomp. */
  handleBossStomp(enemy) {
    soundHub.playEffect(soundHub.soundChickenHit);
    enemy.wasHit();
    this.world.addScore(65);
    this.bounceCharacterOffBoss(enemy);
  }

  /** Bounces the Character away from the Endboss. */
  bounceCharacterOffBoss(enemy) {
    const character = this.world.character;
    const direction = this.getBossBounceDirection(enemy);
    character.speedY = 50;
    character.x += 300 * direction;
    character.isBouncingOffBoss = true;
    this.world.setManagedTimeout(() => this.finishBossBounce(), 500);
  }

  /** Resolves a safe horizontal bounce direction. */
  getBossBounceDirection(enemy) {
    const character = this.world.character;
    let direction = character.x < enemy.x ? -1 : 1;
    const maxX = this.world.level.levelEndX - character.width;
    const predictedX = character.x + 300 * direction;
    if (predictedX < 200 || predictedX > maxX - 200) direction *= -1;
    return direction;
  }

  /** Clears the temporary boss-bounce state. */
  finishBossBounce() {
    const character = this.world.character;
    character.isBouncingOffBoss = false;
    if (typeof character.snapToGround === "function") character.snapToGround();
  }

  /** Applies enemy-contact damage and updates health UI. */
  damageCharacter() {
    const world = this.world;
    const now = Date.now();
    if (now - soundHub.lastHitSoundTime > soundHub.hitSoundCooldown) {
      soundHub.playEffect(soundHub.soundHit);
      soundHub.lastHitSoundTime = now;
    }
    world.character.wasHit();
    world.percentage =
      (world.character.energie / world.character.holeEnergie) * 100;
    world.statusBar.setPercentage(world.percentage);
  }

  /** Checks collectible bottle collisions. */
  checkBottlePickups() {
    for (let i = this.world.level.bottles.length - 1; i >= 0; i--) {
      if (this.world.character.isColliding(this.world.level.bottles[i])) {
        this.collectBottle(i);
      }
    }
  }

  /** Collects one bottle and updates inventory and score. */
  collectBottle(index) {
    const world = this.world;
    soundHub.playEffect(soundHub.soundBottlePickup);
    world.level.bottles.splice(index, 1);
    world.collectedBottles++;
    world.updateBottleBar();
    world.addScore(2);
    world.showBottlePickupEffect();
  }

  /** Checks collectible coin collisions. */
  checkCoinPickups() {
    for (let i = this.world.level.coins.length - 1; i >= 0; i--) {
      if (this.world.character.isColliding(this.world.level.coins[i])) {
        this.collectCoin(i);
      }
    }
  }

  /** Collects one coin and updates counter and score. */
  collectCoin(index) {
    const world = this.world;
    soundHub.playEffect(soundHub.soundCoin);
    world.level.coins.splice(index, 1);
    world.collectedCoins++;
    world.updateCoinBar();
    world.addScore(3);
  }

  /** Checks thrown bottles against normal enemies. */
  checkBottleEnemyHits() {
    for (let i = this.world.throwableObjects.length - 1; i >= 0; i--) {
      const bottle = this.world.throwableObjects[i];
      if (bottle.y > 380) {
        this.world.throwableObjects.splice(i, 1);
        continue;
      }
      if (this.hitChickenWithBottle(bottle, i)) continue;
    }
  }

  /** Checks one bottle against all normal enemies. */
  hitChickenWithBottle(bottle, bottleIndex) {
    for (let i = this.world.level.enemies.length - 1; i >= 0; i--) {
      const enemy = this.world.level.enemies[i];
      if (enemy instanceof Endboss || enemy.isDeadChicken) continue;
      if (!this.isBottleHitTarget(bottle, enemy)) continue;
      this.handleBottleChickenHit(enemy, bottleIndex);
      return true;
    }
    return false;
  }

  /** Resolves a bottle hit on a normal enemy. */
  handleBottleChickenHit(enemy, bottleIndex) {
    soundHub.playEffect(soundHub.soundChickenHit);
    enemy.die();
    this.world.addScore(20);
    this.world.throwableObjects.splice(bottleIndex, 1);
    this.removeEnemyLater(enemy);
  }

  /** Checks thrown bottles against the Endboss. */
  checkBottleBossHits() {
    const boss = this.world.level.enemies.find((enemy) => enemy instanceof Endboss);
    if (!boss || boss.isDeadBoss) return;
    for (let i = this.world.throwableObjects.length - 1; i >= 0; i--) {
      const bottle = this.world.throwableObjects[i];
      if (!this.isBottleHitTarget(bottle, boss)) continue;
      this.world.throwableObjects.splice(i, 1);
      boss.wasHit();
      this.world.addScore(40);
      break;
    }
  }

  /** Checks bottle overlap against a target hit box. */
  isBottleHitTarget(bottle, target) {
    return (
      bottle.x + bottle.width > target.x + target.offset.left &&
      bottle.x < target.x + target.width - target.offset.right &&
      bottle.y + bottle.heigth > target.y + target.offset.top &&
      bottle.y < target.y + target.heigth - target.offset.buttom
    );
  }
}
