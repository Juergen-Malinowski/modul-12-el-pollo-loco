/**
 * Tracks consecutive airborne chicken stomps and controls combo scatter behavior.
 */
class WorldStompComboManager {
  constructor(world) {
    this.world = world;
    this.stompCount = 0;
    this.scatterChecked = false;
  }

  /**
   * Registers one chicken stomp and returns its additional combo bonus.
   *
   * @param {MovableObject} stompedEnemy - Chicken defeated by the current stomp.
   * @returns {number} Bonus points for the current airborne stomp chain.
   */
  registerStomp(stompedEnemy) {
    this.stompCount++;
    this.checkScatterAtComboStart(stompedEnemy);
    if (this.stompCount < 2) return 0;
    return this.getComboBonus();
  }

  /** Returns the exponentially increasing bonus for the current stomp count. */
  getComboBonus() {
    const exponent = this.stompCount - 2;
    return (
      STOMP_COMBO_CONFIG.startBonus *
      Math.pow(STOMP_COMBO_CONFIG.multiplier, exponent)
    );
  }

  /** Checks chicken density once when a new airborne combo begins. */
  checkScatterAtComboStart(stompedEnemy) {
    if (this.stompCount !== 1 || this.scatterChecked) return;
    this.scatterChecked = true;
    const chickens = this.getNearbyChickens();
    if (chickens.length < CHICKEN_SCATTER_CONFIG.minimumNearbyChickens) return;
    this.scatterNearbyChickens(chickens, stompedEnemy);
  }

  /** Returns all living chickens inside the configured radius around Pepe. */
  getNearbyChickens() {
    const enemies = this.world.level.enemies;
    const nearby = [];
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (!this.isLivingChicken(enemy)) continue;
      if (this.getDistanceFromCharacter(enemy) <= CHICKEN_SCATTER_CONFIG.nearbyRadius) {
        nearby.push(enemy);
      }
    }
    return nearby;
  }

  /** Returns whether an enemy is a living normal or small chicken. */
  isLivingChicken(enemy) {
    return (
      (enemy instanceof Chicken || enemy instanceof LittleChicken) &&
      !enemy.isDeadChicken
    );
  }

  /** Returns horizontal center distance between Pepe and one chicken. */
  getDistanceFromCharacter(chicken) {
    const character = this.world.character;
    const characterCenter = character.x + character.width / 2;
    const chickenCenter = chicken.x + chicken.width / 2;
    return Math.abs(characterCenter - chickenCenter);
  }

  /** Starts one visible escape movement for each nearby surviving chicken. */
  scatterNearbyChickens(chickens, stompedEnemy) {
    for (let i = 0; i < chickens.length; i++) {
      const chicken = chickens[i];
      if (chicken === stompedEnemy) continue;
      const plan = this.createScatterPlan(chicken);
      chicken.startScatter(
        plan.targetX,
        plan.direction,
        CHICKEN_SCATTER_CONFIG.movementSpeed,
      );
    }
  }

  /** Creates a boundary-aware random scatter target for one chicken. */
  createScatterPlan(chicken) {
    const distance = this.getRandomScatterDistance(chicken);
    let direction = Math.random() < 0.5 ? -1 : 1;
    direction = this.resolveScatterDirection(chicken, direction, distance);
    return {
      direction: direction,
      targetX: this.getScatterTargetX(chicken, direction, distance),
    };
  }

  /** Returns a random flee distance based on the individual chicken width. */
  getRandomScatterDistance(chicken) {
    const config = CHICKEN_SCATTER_CONFIG;
    const factorRange = config.maxDistanceFactor - config.minDistanceFactor;
    const factor = config.minDistanceFactor + Math.random() * factorRange;
    return chicken.width * factor;
  }

  /** Switches direction when the selected side cannot provide minimum space. */
  resolveScatterDirection(chicken, direction, distance) {
    const minDistance = chicken.width * CHICKEN_SCATTER_CONFIG.minDistanceFactor;
    const preferredSpace = this.getAvailableScatterSpace(chicken, direction);
    if (preferredSpace >= minDistance) return direction;
    const oppositeSpace = this.getAvailableScatterSpace(chicken, -direction);
    if (oppositeSpace > preferredSpace) return -direction;
    return direction;
  }

  /** Returns free horizontal distance to the selected level boundary. */
  getAvailableScatterSpace(chicken, direction) {
    if (direction < 0) return chicken.x;
    return chicken.levelConfig.levelEndX - chicken.width - chicken.x;
  }

  /** Resolves the target without allowing the chicken to leave the level. */
  getScatterTargetX(chicken, direction, distance) {
    const available = Math.max(0, this.getAvailableScatterSpace(chicken, direction));
    const actualDistance = Math.min(distance, available);
    return chicken.x + actualDistance * direction;
  }

  /** Clears the current airborne stomp chain and its scatter check. */
  reset() {
    this.stompCount = 0;
    this.scatterChecked = false;
  }
}
