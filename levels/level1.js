
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
    const enemies = createNormalEnemies(levelConfig);
    enemies.push(new Endboss(levelConfig));
    return enemies;
}

/** Creates normal enemies across separated random spawn slots. */
function createNormalEnemies(levelConfig) {
    const types = createEnemyTypes(levelConfig);
    const positions = createEnemySpawnPositions(levelConfig, types.length);
    const enemies = [];
    shuffleArray(types);
    for (let i = 0; i < types.length; i++) {
        enemies.push(createEnemyByType(types[i], levelConfig, positions[i]));
    }
    return enemies;
}

/** Builds the configured mix of normal and small chickens. */
function createEnemyTypes(levelConfig) {
    const types = [];
    for (let i = 0; i < levelConfig.chickenCount; i++) types.push("chicken");
    for (let i = 0; i < levelConfig.littleChickenCount; i++) types.push("little");
    return types;
}

/** Creates one randomized spawn position inside each horizontal level slot. */
function createEnemySpawnPositions(levelConfig, enemyCount) {
    const startX = 450;
    const endX = levelConfig.levelEndX - 100;
    const slotWidth = (endX - startX) / enemyCount;
    const positions = [];
    for (let i = 0; i < enemyCount; i++) {
        positions.push(getEnemySlotPosition(startX, slotWidth, i));
    }
    return positions;
}

/** Returns a random position from the middle area of one spawn slot. */
function getEnemySlotPosition(startX, slotWidth, index) {
    const slotStart = startX + slotWidth * index;
    const randomStart = slotStart + slotWidth * 0.3;
    return randomStart + Math.random() * slotWidth * 0.4;
}

/** Randomizes enemy types without changing the separated spawn positions. */
function shuffleArray(items) {
    for (let i = items.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const current = items[i];
        items[i] = items[randomIndex];
        items[randomIndex] = current;
    }
}

/** Creates one enemy type at its assigned spawn position. */
function createEnemyByType(type, levelConfig, spawnX) {
    if (type === "little") return new LittleChicken(levelConfig, spawnX);
    return new Chicken(levelConfig, spawnX);
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
