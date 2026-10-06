/**
 * Tracks consecutive airborne chicken stomps and calculates combo bonus points.
 */
class WorldStompComboManager {
  constructor(world) {
    this.world = world;
    this.stompCount = 0;
  }

  /**
   * Registers one chicken stomp and returns its additional combo bonus.
   *
   * @returns {number} Bonus points for the current airborne stomp chain.
   */
  registerStomp() {
    this.stompCount++;
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

  /** Clears the current airborne stomp chain. */
  reset() {
    this.stompCount = 0;
  }
}
