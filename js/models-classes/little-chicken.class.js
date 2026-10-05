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

    constructor(levelConfig = getLevelConfig(1)) {
        super().loadImage('./assets/img/3_feinde_huehner/chicken_small/1_walk/1_w.png');
        this.setLevelValues(levelConfig);
        this.loadImages(this.imagesWalking);
        this.animate();
    }

    /** Applies the configured spawn range and movement speed for this level. */
    setLevelValues(levelConfig) {
        const baseLevel = getLevelConfig(1);
        const scale = levelConfig.levelEndX / baseLevel.levelEndX;
        const requestedRange = 1650 * scale;
        const availableRange = Math.max(0, levelConfig.levelEndX - this.width - 450);
        this.x = 450 + Math.random() * Math.min(requestedRange, availableRange);
        this.speed = levelConfig.littleChickenSpeedBase + Math.random() * levelConfig.littleChickenSpeedRange;
    }

    /**
     * Starts movement and walking animation loops for the small chicken.
     */
    animate() {
        soundHub.registerInterval(setInterval(() => {
            if (!this.isDeadChicken) {
                this.moveLeft();
            }
        }, 1000 / 60));

        soundHub.registerInterval(setInterval(() => {
            if (!this.isDeadChicken) {
                this.playAnimation(this.imagesWalking);
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
