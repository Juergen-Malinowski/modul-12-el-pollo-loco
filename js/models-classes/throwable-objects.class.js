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
     */
    constructor(x = 0, y = 0, isGroundBottle = false, direction = 1) {
        super();

        if (isGroundBottle) {
            this.loadImage('./assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png');
            this.x = 200 + Math.random() * 1600;
            this.y = 380;
        } else {
            this.loadImage('./assets/img/6_salsa_flasche/salsa_bottle.png');
            this.x = x;
            this.y = y;
            this.direction = direction;
            this.throwBottle();
        }
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
            this.x += 10 * this.direction;
        }, 20));
    }
}
