class LittleChicken extends MovableObject {

    heigth = 50;
    width = 50;
    y = 400;
    speed = 0.4;

    offset = {
        top: 4,
        buttom: 4,
        left: 4,
        right: 4,
    };

    imagesWalking = [
        './assets/img/3_feinde_huehner/chicken_small/1_walk/1_w.png',
        './assets/img/3_feinde_huehner/chicken_small/1_walk/2_w.png',
        './assets/img/3_feinde_huehner/chicken_small/1_walk/3_w.png',
    ];

    imageDead = './assets/img/3_feinde_huehner/chicken_small/2_dead/dead.png';
    isDeadChicken = false;
    levelConfig;

    constructor(levelConfig = getLevelConfig(1), spawnX) {
        super().loadImage('./assets/img/3_feinde_huehner/chicken_small/1_walk/1_w.png');
        this.levelConfig = levelConfig;
        this.setLevelValues(levelConfig, spawnX);
        this.loadImages(this.imagesWalking);
        this.animate();
    }

    /** Applies the configured spawn range and movement speed for this level. */
    setLevelValues(levelConfig, spawnX) {
        if (typeof spawnX === "number") {
            this.x = spawnX;
        } else {
            this.x = this.getRandomSpawnX(levelConfig);
        }
        this.setRandomSpeed();
    }

    /** Returns a fallback spawn position inside the playable level. */
    getRandomSpawnX(levelConfig) {
        const availableRange = Math.max(0, levelConfig.levelEndX - this.width - 450);
        return 450 + Math.random() * availableRange;
    }

    /** Selects a new movement speed from the current level range. */
    setRandomSpeed() {
        this.speed = this.levelConfig.littleChickenSpeedBase
            + Math.random() * this.levelConfig.littleChickenSpeedRange;
    }

    /** Moves the small chicken and reverses it at the playable level boundaries. */
    moveWithinLevel() {
        if (this.moveScatterStep()) {
            this.keepInsideLevel();
            return;
        }
        if (this.otherDirection) {
            this.moveRight();
        } else {
            this.moveLeft();
        }
        this.keepInsideLevel();
    }

    /** Keeps the complete small chicken inside the playable level. */
    keepInsideLevel() {
        const rightBoundary = this.levelConfig.levelEndX - this.width;
        if (this.x <= 0) {
            this.turnAtBoundary(0, true);
        } else if (this.x >= rightBoundary) {
            this.turnAtBoundary(rightBoundary, false);
        }
    }

    /** Turns the small chicken around and selects a new random speed. */
    turnAtBoundary(x, otherDirection) {
        this.x = x;
        this.otherDirection = otherDirection;
        this.setRandomSpeed();
    }

    /**
     * Starts movement and walking animation loops for the small chicken.
     */
    animate() {
        var self = this;
        soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (!self.isDeadChicken) {
                self.moveWithinLevel();
            }
        }, 1000 / 60));

        soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (!self.isDeadChicken) {
                self.playAnimation(self.imagesWalking);
            }
        }, 120));
    }

    /**
     * Stops movement and switches to the dead chicken image.
     */
    die() {
        this.isDeadChicken = true;
        this.loadImage(this.imageDead);
        this.speed = 0;
    }
}
