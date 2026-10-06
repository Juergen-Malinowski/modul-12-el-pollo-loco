let canvas;
let world;
let keyboard = new Keyboard();
let score = 0;
let currentLevel = 1;
let bottleCarryover = 0;

/** Resets a fresh game run to Level 1. */
function resetCurrentLevel() {
  currentLevel = 1;
  bottleCarryover = 0;
}

/** Stores unused bottles for the next level of the current run. */
function storeBottleCarryover(amount) {
  bottleCarryover = Math.max(0, amount);
}

/** Returns the bottle inventory carried into the next level. */
function getBottleCarryover() {
  return bottleCarryover;
}

/** Returns whether the active World is currently paused. */
function isGamePaused() {
  return !!(window.world && window.world.isPaused);
}

/**
 * Returns the configuration for the active level.
 *
 * @returns {{number:number,label:string,levelEndX:number}} Active level configuration.
 */
function getCurrentLevelConfig() {
  return getLevelConfig(currentLevel);
}

/**
 * Advances the run by one level without resetting the accumulated score.
 */
function advanceLevel() {
  if (currentLevel >= 3) return;
  currentLevel++;
  init();
}

/**
 * Converts pointer coordinates from the displayed canvas size
 * to the canvas' internal coordinate system.
 *
 * @param {MouseEvent} event - Pointer event on the canvas.
 * @param {HTMLCanvasElement} canvasElement - Canvas receiving the event.
 * @returns {{x: number, y: number}} Internal canvas coordinates.
 */
function getCanvasCoordinates(event, canvasElement) {
  const rect = canvasElement.getBoundingClientRect();
  const scaleX = canvasElement.width / rect.width;
  const scaleY = canvasElement.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

/**
 * Replaces any existing World with a freshly initialized game instance.
 */
function init() {
  canvas = document.getElementById("canvas");

  if (world && typeof world.destroy === "function") {
    world.destroy();
  }

  const levelConfig = getCurrentLevelConfig();
  initLevel(levelConfig);
  world = new World(canvas, keyboard, level1, levelConfig);
  world.specialJumpManager = new WorldSpecialJumpManager(world);
  window.world = world;
}

window.addEventListener("keydown", function (e) {
  if ((e.key === "p" || e.key === "P") && !e.repeat) {
    if (window.world) window.world.togglePause();
    return;
  }
  if (isGamePaused()) return;
  switch (e.key) {
    case "ArrowLeft":
      keyboard.LEFT = true;
      break;
    case "ArrowRight":
      keyboard.RIGHT = true;
      break;
    case "ArrowUp":
      keyboard.UP = true;
      break;
    case "ArrowDown":
      keyboard.DOWN = true;
      break;
    case " ":
      keyboard.SPACE = true;
      if (!e.repeat) registerJumpPress();
      break;
    case "Shift":
      keyboard.SHIFT = true;
      break;
    case "Enter":
      keyboard.ENTER = true;
      break;
    default:
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowLeft":
      keyboard.LEFT = false;
      break;
    case "ArrowRight":
      keyboard.RIGHT = false;
      break;
    case "ArrowUp":
      keyboard.UP = false;
      break;
    case "ArrowDown":
      keyboard.DOWN = false;
      break;
    case "Space":
      keyboard.SPACE = false;
      break;
    case "ShiftLeft":
    case "ShiftRight":
      keyboard.SHIFT = false;
      break;
    case "Enter":
      keyboard.ENTER = false;
      break;
  }
});

/** Routes one physical Jump press to the active Special Jump detector. */
function registerJumpPress() {
  if (!window.world || !window.world.specialJumpManager) return;
  window.world.specialJumpManager.registerJumpPress();
}
