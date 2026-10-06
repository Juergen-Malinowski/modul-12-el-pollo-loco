/**
 * Adds movement, gravity, collision, damage, and animation behavior to drawable objects.
 */
class MovableObject extends DrawableObjects {

    speed = 0.1;
    otherDirection = false;
    speedY = 0;
    acceleration = 4;
    isScattering = false;
    scatterTargetX = null;
    scatterDirection = 0;
    scatterSpeed = 0;
    scatterGroundY = 0;
    scatterVerticalSpeed = 0;
    scatterGravity = 0;

    energie = 100;
    lastHit = 0;
    offset = {
        top: 0,
        buttom: 0,
        left: 0,
        right: 0,
    }

    /**
     * Reports whether the object should continue vertical movement.
     *
     * @returns {boolean} True while the object is above its ground boundary.
     */
    isAboveGround() {
        if (this instanceof ThrowableObjects) {
            return true;
        } else {
            return this.y < 130;
        }
    }

    /**
     * Applies gravity using a shared gameplay interval.
     */
    applyGravity() {
        soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 30));
    }

    /**
     * Checks overlap with another movable object using collision offsets.
     *
     * @param {MovableObject} movableObject - Object to test against.
     * @returns {boolean} True when the collision areas overlap.
     */
    isColliding(movableObject) {
        if (movableObject instanceof ThrowableObjects) {
            return (
                this.x + this.width >
                    movableObject.x + movableObject.offset.left &&
                this.y + this.heigth >= movableObject.y
            );
        }

        return (
            this.x + this.width - this.offset.right >
                movableObject.x + movableObject.offset.left &&
            this.x + this.offset.left <
                movableObject.x + movableObject.width - movableObject.offset.right &&
            this.y + this.heigth - this.offset.buttom >
                movableObject.y + movableObject.offset.top &&
            this.y + this.offset.top <
                movableObject.y + movableObject.heigth - movableObject.offset.buttom
        );
    }

    /**
     * Applies damage and refreshes Character activity state after a hit.
     */
    wasHit() {
        if (
            this instanceof Character &&
            typeof soundHub !== "undefined" &&
            soundHub &&
            typeof soundHub.stopSnoring === "function"
        ) {
            try {
                soundHub.stopSnoring();
            } catch (e) { }
        }

        if (this instanceof Character) {
            try {
                this.lastActionTime = Date.now();
            } catch (e) { }
        }

        this.energie -= 1;
        if (this.energie < 0) {
            this.energie = 0;
        } else {
            this.lastHit = new Date().getTime();
        }
    }

    /**
     * Reports whether the object is still inside its post-hit hurt period.
     *
     * @returns {boolean} True for three seconds after the latest hit.
     */
    isHurt() {
        let passedTime = new Date().getTime() - this.lastHit;
        passedTime = passedTime / 1000;
        return passedTime < 3;
    }

    /**
     * Reports whether the object's energy is depleted.
     *
     * @returns {boolean} True when no energy remains.
     */
    isDead() {
        return this.energie == 0;
    }

    /**
     * Advances to the next cached image in an animation sequence.
     *
     * @param {string[]} images - Ordered animation image paths.
     */
    playAnimation(images) {
        if (this.isThrowing || this.isDeadAnimationPlaying) {
            return;
        }

        if (!images || images.length === 0) return;

        let i = this.correntImage % images.length;
        let path = images[i];
        let img = this.imageCache[path];

        if (img) {
            this.img = img;
        }
        this.correntImage++;
    }

    /**
     * Moves the object left and stops Character snoring when applicable.
     */
    moveLeft() {
        this.x -= this.speed;
        if (
            this instanceof Character &&
            typeof this.stopSnoringSound === "function"
        ) {
            this.stopSnoringSound();
        }
    }

    /**
     * Moves the object right and stops Character snoring when applicable.
     */
    moveRight() {
        this.x += this.speed;
        if (
            this instanceof Character &&
            typeof this.stopSnoringSound === "function"
        ) {
            this.stopSnoringSound();
        }
    }

    /**
     * Starts one randomized scatter movement with an optional panic hop.
     *
     * @param {number} targetX - Horizontal position where scatter movement ends.
     * @param {number} direction - Horizontal movement direction, -1 or 1.
     * @param {number} speed - Temporary horizontal scatter speed.
     * @param {number} hopSpeed - Initial upward hop speed, or zero for no hop.
     * @param {number} gravity - Vertical scatter gravity.
     */
    startScatter(targetX, direction, speed, hopSpeed, gravity) {
        this.isScattering = true;
        this.scatterTargetX = targetX;
        this.scatterDirection = direction;
        this.scatterSpeed = speed;
        this.scatterGroundY = this.y;
        this.scatterVerticalSpeed = hopSpeed;
        this.scatterGravity = gravity;
        this.otherDirection = direction > 0;
    }

    /** Moves one scatter frame and reports whether scatter owns movement. */
    moveScatterStep() {
        if (!this.isScattering) return false;
        this.moveScatterHorizontal();
        this.moveScatterVertical();
        if (this.isScatterComplete()) this.finishScatter();
        return true;
    }

    /** Advances the horizontal flee movement toward its boundary-safe target. */
    moveScatterHorizontal() {
        if (this.scatterTargetX === null) return;
        const nextX = this.x + this.scatterSpeed * this.scatterDirection;
        if (this.hasReachedScatterTarget(nextX)) {
            this.x = this.scatterTargetX;
            this.scatterTargetX = null;
            return;
        }
        this.x = nextX;
    }

    /** Applies the optional short panic hop while scatter remains active. */
    moveScatterVertical() {
        if (this.scatterVerticalSpeed === 0 && this.y >= this.scatterGroundY) return;
        this.y -= this.scatterVerticalSpeed;
        this.scatterVerticalSpeed -= this.scatterGravity;
        if (this.y >= this.scatterGroundY) {
            this.y = this.scatterGroundY;
            this.scatterVerticalSpeed = 0;
        }
    }

    /** Returns whether the next movement step reaches or passes the scatter target. */
    hasReachedScatterTarget(nextX) {
        if (this.scatterDirection > 0) return nextX >= this.scatterTargetX;
        return nextX <= this.scatterTargetX;
    }

    /** Returns whether horizontal escape and the optional hop are complete. */
    isScatterComplete() {
        return (
            this.scatterTargetX === null &&
            this.scatterVerticalSpeed === 0 &&
            this.y >= this.scatterGroundY
        );
    }

    /** Finishes scatter and resumes normal movement in the escape direction. */
    finishScatter() {
        this.y = this.scatterGroundY;
        this.isScattering = false;
        this.scatterTargetX = null;
        this.scatterDirection = 0;
        this.scatterSpeed = 0;
        this.scatterVerticalSpeed = 0;
        this.scatterGravity = 0;
        if (typeof this.setRandomSpeed === "function") this.setRandomSpeed();
    }

    /**
     * Starts an upward jump and stops Character snoring when applicable.
     */
    jump() {
        this.speedY = 45;
        if (
            this instanceof Character &&
            typeof this.stopSnoringSound === "function"
        ) {
            this.stopSnoringSound();
        }
    }
}
