const LEVEL_CONFIGS = Object.freeze({
  1: Object.freeze({
    number: 1,
    label: "Level 1",
    levelEndX: 2000,
  }),
  2: Object.freeze({
    number: 2,
    label: "Level 2",
    levelEndX: 2720,
  }),
  3: Object.freeze({
    number: 3,
    label: "Level 3",
    levelEndX: 3440,
  }),
});

/**
 * Returns the configuration for one game level.
 *
 * @param {number} levelNumber - Requested level number.
 * @returns {{number:number,label:string,levelEndX:number}} Level configuration.
 */
function getLevelConfig(levelNumber) {
  return LEVEL_CONFIGS[levelNumber] || LEVEL_CONFIGS[1];
}
