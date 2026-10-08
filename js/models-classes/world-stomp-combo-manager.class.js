/**
 * Tracks consecutive airborne chicken stomps and controls combo scatter behavior.
 */
class WorldStompComboManager {
  /**
   * Creates the airborne stomp-combo manager for one World.
   *
   * @param {World} world - Owning game World.
   */
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
    return STOMP_COMBO_CONFIG.startBonus *
      Math.pow(STOMP_COMBO_CONFIG.multiplier, exponent);
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
      if (this.isLivingChicken(enemies[i]) && this.isChickenNearby(enemies[i])) {
        nearby.push(enemies[i]);
      }
    }
    return nearby;
  }

  /** Returns whether one chicken is inside the configured scatter radius. */
  isChickenNearby(chicken) {
    return this.getDistanceFromCharacter(chicken) <=
      CHICKEN_SCATTER_CONFIG.nearbyRadius;
  }

  /** Returns whether an enemy is a living normal or small chicken. */
  isLivingChicken(enemy) {
    return (enemy instanceof Chicken || enemy instanceof LittleChicken) &&
      !enemy.isDeadChicken;
  }

  /** Returns horizontal center distance between Pepe and one chicken. */
  getDistanceFromCharacter(chicken) {
    const character = this.world.character;
    const characterCenter = character.x + character.width / 2;
    const chickenCenter = chicken.x + chicken.width / 2;
    return Math.abs(characterCenter - chickenCenter);
  }

  /** Starts randomized escape behavior for each nearby surviving chicken. */
  scatterNearbyChickens(chickens, stompedEnemy) {
    let scatterStarted = false;
    for (let i = 0; i < chickens.length; i++) {
      if (chickens[i] === stompedEnemy) continue;
      this.startChickenScatter(chickens[i]);
      scatterStarted = true;
    }
    if (!scatterStarted) return;
    soundHub.playEffect(soundHub.soundScatter);
    this.world.batFlightManager.startFlight();
  }

  /** Starts one chicken with its independently randomized scatter plan. */
  startChickenScatter(chicken) {
    const plan = this.createScatterPlan(chicken);
    chicken.startScatter(
      plan.targetX,
      plan.direction,
      plan.speed,
      plan.hopSpeed,
      CHICKEN_SCATTER_CONFIG.hopGravity,
    );
  }

  /** Creates a boundary-aware random scatter plan for one chicken. */
  createScatterPlan(chicken) {
    const distance = this.getRandomScatterDistance(chicken);
    let direction = this.getRandomScatterDirection(chicken);
    direction = this.resolveScatterDirection(chicken, direction);
    return {
      direction: direction,
      targetX: this.getScatterTargetX(chicken, direction, distance),
      speed: this.getRandomScatterSpeed(),
      hopSpeed: this.getRandomHopSpeed(),
    };
  }

  /** Randomly keeps or reverses the chicken's current walking direction. */
  getRandomScatterDirection(chicken) {
    const currentDirection = chicken.otherDirection ? 1 : -1;
    if (Math.random() < CHICKEN_SCATTER_CONFIG.reverseChance) {
      return -currentDirection;
    }
    return currentDirection;
  }

  /** Returns a random flee distance based on the individual chicken width. */
  getRandomScatterDistance(chicken) {
    const config = CHICKEN_SCATTER_CONFIG;
    const range = config.maxDistanceFactor - config.minDistanceFactor;
    const factor = config.minDistanceFactor + Math.random() * range;
    return chicken.width * factor;
  }

  /** Returns a varied horizontal scatter speed. */
  getRandomScatterSpeed() {
    const config = CHICKEN_SCATTER_CONFIG;
    const range = config.maxMovementSpeed - config.minMovementSpeed;
    return config.minMovementSpeed + Math.random() * range;
  }

  /** Randomly assigns a short panic hop to part of the scattering group. */
  getRandomHopSpeed() {
    const config = CHICKEN_SCATTER_CONFIG;
    if (Math.random() >= config.hopChance) return 0;
    const range = config.maxHopSpeed - config.minHopSpeed;
    return config.minHopSpeed + Math.random() * range;
  }

  /** Switches direction when the selected side lacks minimum escape space. */
  resolveScatterDirection(chicken, direction) {
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
    const actualDistance = Math.min(distance, Math.max(0, available - 1));
    return chicken.x + actualDistance * direction;
  }

  /** Clears the current airborne stomp chain and its scatter check. */
  reset() {
    this.stompCount = 0;
    this.scatterChecked = false;
  }
}
