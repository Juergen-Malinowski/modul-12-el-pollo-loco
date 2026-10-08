/**
 * Handles collisions, collectible pickups, and projectile hits for one World.
 */
class WorldCollisionManager {
  /**
   * Creates the collision manager for one World.
   *
   * @param {World} world - Owning game World.
   */
  constructor(world) {
    this.world = world;
  }

  /**
   * Resolves all collision groups for the current game tick.
   */
  checkCollisions() {
    if (this.world.gameOver) return;
    this.checkEnemyCollisions();
    if (this.world.gameOver) return;
    this.checkBottlePickups();
    this.checkCoinPickups();
    this.checkBottleEnemyHits();
    this.checkBottleBossHits();
  }

  /** Checks all enemy collisions for the current tick. */
  checkEnemyCollisions() {
    for (let i = this.world.level.enemies.length - 1; i >= 0; i--) {
      this.handleEnemyCollision(this.world.level.enemies[i]);
      if (this.world.gameOver) return;
    }
  }

  /** Resolves one enemy collision with the Character. */
  handleEnemyCollision(enemy) {
    if (!this.world.character.isColliding(enemy)) return;
    if (this.world.character.isSpecialJumping) return;
    if (this.isStompCollision(enemy) && this.resolveStompCollision(enemy)) return;
    if (enemy instanceof Endboss) {
      this.handleBossContact(enemy);
      return;
    }
    if (enemy.isScattering) return;
    if (!enemy.isDeadChicken) this.damageCharacter();
  }

  /** Resolves normal Endboss contact without interfering with charge hits. */
  handleBossContact(enemy) {
    if (enemy.isDeadBoss || enemy.isCharging || enemy.isInHitRecovery()) return;
    if (!this.hasCharacterGroundContact()) return;
    this.damageCharacter();
  }

  /** Returns whether Pepe currently has ground contact. */
  hasCharacterGroundContact() {
    const character = this.world.character;
    return !character.isAboveGround() && character.speedY <= 0;
  }

  /** Checks whether the Character lands on an enemy from above. */
  isStompCollision(enemy) {
    const character = this.world.character;
    if (
      enemy instanceof Endboss &&
      (!character.isBossJumpAttack || character.isBossKnockback)
    ) return false;
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
    const comboBonus = world.stompComboManager.registerStomp(enemy);
    enemy.die();
    const scoreConfig = world.levelConfig.score;
    const points = enemy instanceof LittleChicken
      ? scoreConfig.littleChickenStomp
      : scoreConfig.chickenStomp;
    world.addScore(points + comboBonus);
    this.removeEnemyLater(enemy);
    soundHub.playEffect(soundHub.soundChickenMud);
  }

  /** Schedules removal of a defeated enemy. */
  removeEnemyLater(enemy) {
    const world = this.world;
    world.setManagedTimeout(function () {
      const index = world.level.enemies.indexOf(enemy);
      if (index > -1) world.level.enemies.splice(index, 1);
    }, 2000);
  }

  /** Applies damage and bounce behavior for an Endboss stomp. */
  handleBossStomp(enemy) {
    const character = this.world.character;
    const hitApplied = enemy.wasHit();
    character.isBossJumpAttack = false;
    if (hitApplied) {
      soundHub.playEffect(soundHub.soundChickenHit);
      this.world.addScore(this.world.levelConfig.score.bossStomp);
    }
    this.bounceCharacterOffBoss(enemy);
  }

  /** Bounces the Character away from the Endboss. */
  bounceCharacterOffBoss(enemy) {
    const character = this.world.character;
    const direction = this.getBossBounceDirection(enemy);
    character.speedY = 50;
    character.x += 300 * direction;
    character.isBossJumpAttack = false;
    character.isBouncingOffBoss = true;
    const manager = this;
    this.world.setManagedTimeout(function () {
      manager.finishBossBounce();
    }, 500);
  }

  /** Resolves a safe horizontal bounce direction. */
  getBossBounceDirection(enemy) {
    const character = this.world.character;
    const targetX = this.getSafeBossKnockbackTarget(enemy, 300);
    return targetX < character.x ? -1 : 1;
  }

  /** Applies one boss-caused knockback after its safe target was resolved. */
  applyBossAttackKnockback(enemy) {
    const character = this.world.character;
    if (character.isSpecialJumping && this.world.specialJumpManager) {
      this.world.specialJumpManager.cancel();
    }
    const targetX = this.getSafeBossKnockbackTarget(enemy, 300);
    character.isBossKnockback = true;
    character.isBossJumpAttack = false;
    character.speedY = 25;
    character.x = targetX;
  }

  /** Resolves the complete horizontal knockback target before Pepe is moved. */
  getSafeBossKnockbackTarget(enemy, distance) {
    const character = this.world.character;
    const direction = this.getDirectionAwayFromBoss(enemy);
    const preferredTarget = character.x + distance * direction;
    if (this.isCharacterXInsideLevel(preferredTarget)) return preferredTarget;
    const alternativeTarget = character.x - distance * direction;
    return Math.max(character.getLeftBoundary(),
      Math.min(character.getRightBoundary(), alternativeTarget));
  }

  /** Returns the horizontal direction leading away from the Endboss. */
  getDirectionAwayFromBoss(enemy) {
    const characterCenter = this.world.character.x + this.world.character.width / 2;
    const bossCenter = enemy.x + enemy.width / 2;
    return characterCenter < bossCenter ? -1 : 1;
  }

  /** Checks whether Pepe would remain completely inside the level. */
  isCharacterXInsideLevel(x) {
    const character = this.world.character;
    return x >= character.getLeftBoundary() && x <= character.getRightBoundary();
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
    world.character.startDeathAnimationIfNeeded();
  }

  /** Checks collectible bottle collisions. */
  checkBottlePickups() {
    for (let i = this.world.level.bottles.length - 1; i >= 0; i--) {
      if (this.isBottlePickupCollision(this.world.level.bottles[i])) {
        this.collectBottle(i);
      }
    }
  }

  /** Checks whether Pepe's actual hit box overlaps a ground bottle. */
  isBottlePickupCollision(bottle) {
    const character = this.world.character;
    return (
      character.x + character.width - character.offset.right > bottle.x &&
      character.x + character.offset.left < bottle.x + bottle.width &&
      character.y + character.heigth - character.offset.buttom > bottle.y &&
      character.y + character.offset.top < bottle.y + bottle.heigth
    );
  }

  /** Collects one bottle and updates inventory and score. */
  collectBottle(index) {
    const world = this.world;
    soundHub.playEffect(soundHub.soundBottlePickup);
    world.level.bottles.splice(index, 1);
    world.collectedBottles++;
    world.updateBottleBar();
    world.addScore(world.levelConfig.score.bottlePickup);
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
    world.addScore(world.levelConfig.score.coinPickup);
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
    const scoreConfig = this.world.levelConfig.score;
    const points = enemy instanceof LittleChicken
      ? scoreConfig.littleChickenBottleKill
      : scoreConfig.chickenBottleKill;
    this.world.addScore(points);
    this.world.throwableObjects.splice(bottleIndex, 1);
    this.removeEnemyLater(enemy);
  }

  /** Checks thrown bottles against the Endboss. */
  checkBottleBossHits() {
    const boss = this.world.level.enemies.find(function (enemy) {
      return enemy instanceof Endboss;
    });
    if (!boss || boss.isDeadBoss) return;
    for (let i = this.world.throwableObjects.length - 1; i >= 0; i--) {
      const bottle = this.world.throwableObjects[i];
      if (!this.isBottleHitTarget(bottle, boss)) continue;
      this.world.throwableObjects.splice(i, 1);
      const hitApplied = boss.wasHit();
      if (hitApplied) {
        this.world.addScore(this.world.levelConfig.score.bossBottleHit);
        boss.registerPreAlertBottleHit();
      }
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
