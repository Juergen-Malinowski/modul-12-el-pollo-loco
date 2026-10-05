class level {
  enemies;
  bottles;
  coins;
  clouds;
  backgroundObjects;
  levelEndX;

  /**
   * Creates one playable level from its game objects and world boundary.
   */
  constructor(enemies, bottles, coins, clouds, backgroundObjects, levelEndX = 2000) {
    this.enemies = enemies;
    this.bottles = bottles;
    this.coins = coins || [];
    this.clouds = clouds;
    this.backgroundObjects = backgroundObjects;
    this.levelEndX = levelEndX;
  }
}
