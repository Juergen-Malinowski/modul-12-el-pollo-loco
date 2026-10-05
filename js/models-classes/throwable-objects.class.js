/**
 * Represents either a collectible ground bottle or a bottle thrown by Pepe.
 */
class ThrowableObjects extends MovableObject {

    width = 60;
    heigth = 80;
    y = 380;

    /**
     * Creates a ground bottle or starts a thrown bottle immediately.
     *
     * @param {number} x - Initial horizontal position for thrown bottles.
     * @param {number} y - Initial vertical position for thrown bottles.
     * @param {boolean} isGroundBottle - Whether the bottle is collectible.
     * @param {number} direction - Horizontal throw direction.
     * @param {Object} levelConfig - Configuration of the current level.
     */
    constructor(x = 0, y = 0, isGroundBottle = false, direction = 1, levelConfig = getLevelConfig(1)) {
        super();

        if (isGroundBottle) {
            this.loadImage('./assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png');
            this.setGroundBottlePosition(levelConfig);
        } else {
            this.loadImage('./assets/img/6_salsa_flasche/salsa_bottle.png');
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.throwBottle();
        }
    }

    /** Places a collectible bottle inside the configured level width. */
    setGroundBottlePosition(levelConfig) {
        const baseLevel = getLevelConfig(1);
        const scale = levelConfig.levelEndX / baseLevel.levelEndX;
        const requestedRange = 1600 * scale;
        const availableRange = Math.max(0, levelConfig.levelEndX - this.width - 200);
        this.x = 200 + Math.random() * Math.min(requestedRange, availableRange);
        this.y = 380;
    }

    /**
     * Applies gravity and horizontal movement to a thrown bottle.
     */
    throwBottle() {
        if (
            window.world &&
            world.character &&
            typeof world.character.stopSnoringSound === "function"
        ) {
            world.character.stopSnoringSound();
        }

        this.speedY = 30;
        this.applyGravity();

        soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            this.x += 10 * this.direction;
        }, 20));
    }
}
