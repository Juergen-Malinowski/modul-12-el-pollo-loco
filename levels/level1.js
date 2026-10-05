
let level1;

/**
 * Creates the configured level with its enemies, collectibles, clouds, and background.
 */
function initLevel(levelConfig = getLevelConfig(1)) {
    level1 = new level(
        createEnemies(levelConfig),
        createGroundBottles(levelConfig),
        createCoins(levelConfig),
        createClouds(),
        createBackgroundObjects(),
        levelConfig.levelEndX,
    );
}

/** Creates the configured numbers of normal enemies plus one Endboss. */
function createEnemies(levelConfig) {
    const enemies = [];
    for (let i = 0; i < levelConfig.chickenCount; i++) {
        enemies.push(new Chicken(levelConfig));
    }
    for (let i = 0; i < levelConfig.littleChickenCount; i++) {
        enemies.push(new LittleChicken(levelConfig));
    }
    enemies.push(new Endboss(levelConfig));
    return enemies;
}

/** Creates the configured number of collectible ground bottles. */
function createGroundBottles(levelConfig) {
    const bottles = [];
    for (let i = 0; i < levelConfig.groundBottleCount; i++) {
        bottles.push(new ThrowableObjects(0, 0, true, 1, levelConfig));
    }
    return bottles;
}

/** Creates the configured number of coins. */
function createCoins(levelConfig) {
    const coins = [];
    for (let i = 0; i < levelConfig.coinCount; i++) {
        coins.push(new Coin(undefined, undefined, levelConfig));
    }
    return coins;
}

/** Creates the existing cloud composition used by every level. */
function createClouds() {
    return [
        new Cloud(-200, 60),
        new Cloud(450, 50),
        new Cloud(900, 70),
        new Cloud(1650, 55),
        new Cloud(1440, 70),
        new Cloud(120, 40),
        new Cloud(1250, 20),
        new Cloud(1950, 15),
    ];
}

/** Creates the established Level 1 background base extended later by the level manager. */
function createBackgroundObjects() {
    return [
        new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', -720),
        new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/2.png', -720),
        new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/2.png', -720),
        new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/2.png', -720),

        new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 0),
        new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/1.png', 0),
        new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/1.png', 0),
        new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/1.png', 0),

        new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 720),
        new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/2.png', 720),
        new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/2.png', 720),
        new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/2.png', 720),

        new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 1440),
        new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/1.png', 1440),
        new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/1.png', 1440),
        new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/1.png', 1440),

        new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 2160),
        new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/2.png', 2160),
        new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/2.png', 2160),
        new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/2.png', 2160),
    ];
}
