/**
 * Controls Pepe's movement, animation states, and character-specific audio behavior.
 */
class Character extends MovableObject {

    heigth = 330;
    width = 150;
    y = 0;
    x = 200;
    speed = 20;
    world;
    energie = 300;
    holeEnergie = 300;
    isDeadAnimationPlaying = false;
    isBossKnockback = false;

    offset = {
        top: 130,
        buttom: 10,
        left: 40,
        right: 40,
    };

    imagesWalking = [
        './assets/img/2_charakter_pepe/2_walk/W-21.png',
        './assets/img/2_charakter_pepe/2_walk/W-22.png',
        './assets/img/2_charakter_pepe/2_walk/W-23.png',
        './assets/img/2_charakter_pepe/2_walk/W-24.png',
        './assets/img/2_charakter_pepe/2_walk/W-25.png',
        './assets/img/2_charakter_pepe/2_walk/W-26.png',
    ];

    imagesJumping = [
        './assets/img/2_charakter_pepe/3_jump/J-33.png',
        './assets/img/2_charakter_pepe/3_jump/J-34.png',
        './assets/img/2_charakter_pepe/3_jump/J-35.png',
        './assets/img/2_charakter_pepe/3_jump/J-36.png',
        './assets/img/2_charakter_pepe/3_jump/J-37.png',
        './assets/img/2_charakter_pepe/3_jump/J-38.png',
        './assets/img/2_charakter_pepe/3_jump/J-39.png',
        './assets/img/2_charakter_pepe/3_jump/J-31.png',
    ];

    imagesDead = [
        './assets/img/2_charakter_pepe/5_dead/D-51.png',
        './assets/img/2_charakter_pepe/5_dead/D-52.png',
        './assets/img/2_charakter_pepe/5_dead/D-53.png',
        './assets/img/2_charakter_pepe/5_dead/D-54.png',
        './assets/img/2_charakter_pepe/5_dead/D-55.png',
        './assets/img/2_charakter_pepe/5_dead/D-56.png',
    ];

    imagesHurt = [
        './assets/img/2_charakter_pepe/4_hurt/H-41.png',
        './assets/img/2_charakter_pepe/4_hurt/H-42.png',
        './assets/img/2_charakter_pepe/4_hurt/H-43.png',
    ];

    imagesWating = [
        './assets/img/2_charakter_pepe/1_idle/idle/I-1.png',
        './assets/img/2_charakter_pepe/1_idle/idle/I-4.png',
        './assets/img/2_charakter_pepe/1_idle/idle/I-7.png',
        './assets/img/2_charakter_pepe/1_idle/idle/I-8.png',
        './assets/img/2_charakter_pepe/1_idle/idle/I-9.png',
        './assets/img/2_charakter_pepe/1_idle/idle/I-10.png',
    ];

    imagesLongWaiting = [
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-11.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-12.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-13.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-14.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-15.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-16.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-17.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-18.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-19.png',
        './assets/img/2_charakter_pepe/1_idle/long_idle/I-20.png',
    ];

    imagesThrowing = [
        './assets/img/2_charakter_pepe/2_walk/W-24.png',
        './assets/img/2_charakter_pepe/2_walk/W-25.png',
        './assets/img/2_charakter_pepe/2_walk/W-26.png',
    ];

    lastActionTime = Date.now();

    constructor() {
        super().loadImage('./assets/img/2_charakter_pepe/2_walk/W-21.png');
        this.loadImages(this.imagesWalking);
        this.loadImages(this.imagesJumping);
        this.loadImages(this.imagesDead);
        this.loadImages(this.imagesHurt);
        this.loadImages(this.imagesWating);
        this.loadImages(this.imagesLongWaiting);
        this.loadImages(this.imagesThrowing);
        this.applyGravity();
        this.animate();
    }

    /** Starts movement and sprite-animation processing for Pepe. */
    animate() {
        this.startMovementLoop();
        this.startAnimationLoop();
    }

    /** Starts the recurring movement update loop. */
    startMovementLoop() {
        const character = this;
        soundHub.registerInterval(setInterval(function () {
            character.handleMovementTick();
        }, 100));
    }

    /** Processes movement input and camera positioning for one movement tick. */
    handleMovementTick() {
        if (typeof isGamePaused === "function" && isGamePaused()) return;
        if (this.isDeadAnimationPlaying) return;
        this.handleHorizontalMovement();
        this.handleJumpInput();
        if (!this.isAboveGround() && this.speedY <= 0) this.snapToGround();
        this.updateCameraPosition();
    }

    /** Applies horizontal input and updates the current facing direction. */
    handleHorizontalMovement() {
        if (this.world.keyboard.RIGHT && this.x < this.getRightBoundary()) {
            this.moveRightWithinLevel();
            this.otherDirection = false;
            this.registerMovementAction();
        }
        if (this.world.keyboard.LEFT && this.x > this.getLeftBoundary()) {
            this.moveLeftWithinLevel();
            this.otherDirection = true;
            this.registerMovementAction();
        }
    }

    /** Applies a jump when the jump key is pressed while Pepe is grounded. */
    handleJumpInput() {
        if (!this.world.keyboard.SPACE || this.isAboveGround()) return;
        soundHub.playEffect(soundHub.soundJumping);
        this.speedY = 45;
        this.registerMovementAction();
    }

    /** Records player movement and stops idle snoring. */
    registerMovementAction() {
        this.lastActionTime = Date.now();
        soundHub.stopSnoring();
    }

    /** Starts the recurring sprite-animation update loop. */
    startAnimationLoop() {
        const character = this;
        soundHub.registerInterval(setInterval(function () {
            character.handleAnimationTick();
        }, 150));
    }

    /** Selects the correct sprite animation for the current character state. */
    handleAnimationTick() {
        if (typeof isGamePaused === "function" && isGamePaused()) return;
        if (this.startDeathAnimationIfRequired()) return;
        if (this.isDeadAnimationPlaying) return;
        if (this.playHurtAnimationIfRequired()) return;
        if (this.isAboveGround()) {
            this.playAnimation(this.imagesJumping);
        } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.playAnimation(this.imagesWalking);
        } else {
            this.playIdleAnimation();
        }
    }

    /** Starts the death animation once when Pepe has been defeated. */
    startDeathAnimationIfRequired() {
        if (!this.isDead() || this.isDeadAnimationPlaying) return false;
        this.isDeadAnimationPlaying = true;
        this.world.gameStateManager.markPlayerDefeated();
        soundHub.stopSnoring();
        this.playDeadAnimation();
        return true;
    }

    /** Plays the hurt animation when Pepe is currently damaged. */
    playHurtAnimationIfRequired() {
        if (!this.isHurt()) return false;
        soundHub.stopSnoring();
        this.lastActionTime = Date.now();
        this.playAnimation(this.imagesHurt);
        return true;
    }

    /** Selects the short-idle, long-idle, or quiet idle state. */
    playIdleAnimation() {
        const idleTime = (Date.now() - this.lastActionTime) / 1000;
        if (idleTime < 3) {
            this.playAnimation(this.imagesWating);
            soundHub.stopSnoring();
        } else if (idleTime >= 5) {
            this.playAnimation(this.imagesLongWaiting);
            this.playSnoringIfRequired();
        } else {
            soundHub.stopSnoring();
        }
    }

    /** Starts snoring only when no snoring sound is already playing. */
    playSnoringIfRequired() {
        if (!soundHub.snoringAudio || soundHub.snoringAudio.paused) {
            soundHub.playSnoring();
        }
    }

    /**
     * Plays the death sequence and schedules the coffin transition on the owning World.
     */
    playDeadAnimation() {
        this.speedY = 0;
        this.acceleration = 0;

        let i = 0;
        const character = this;
        const deathInterval = soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (i < character.imagesDead.length) {
                const path = character.imagesDead[i];
                character.img = character.imageCache[path];
                i++;
            } else {
                clearInterval(deathInterval);
                character.world.setManagedTimeout(function () {
                    character.img =
                        character.imageCache[character.imagesDead[character.imagesDead.length - 1]];
                }, 200);
            }
        }, 200));

        if (this.world) {
            this.world.setManagedTimeout(function () {
                character.world.startCoffinAnimation();
            }, 1000);
        }
    }

    /**
     * Plays the throw animation and resets its state within the World lifecycle.
     */
    playThrowAnimation() {
        this.lastActionTime = Date.now();
        this.isThrowing = true;
        const character = this;
        this.world.setManagedTimeout(function () {
            character.isThrowing = false;
        }, 400);
        if (this.isDeadAnimationPlaying) return;

        let i = 0;
        const throwInterval = soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (i < character.imagesThrowing.length) {
                const path = character.imagesThrowing[i];
                character.img = character.imageCache[path];
                i++;
            } else {
                clearInterval(throwInterval);
            }
        }, 20));
    }

    /** Keeps the camera inside the playable level while it follows Pepe. */
    updateCameraPosition() {
        const desiredCameraX = -this.x + 200;
        const minCameraX = this.world.canvas.width - this.world.level.levelEndX;
        this.world.cameraX = Math.max(minCameraX, Math.min(0, desiredCameraX));
    }

    /** Returns Pepe's left movement boundary inside the level. */
    getLeftBoundary() {
        return 0;
    }

    /** Returns Pepe's right movement boundary while keeping him fully visible. */
    getRightBoundary() {
        return Math.max(
            this.getLeftBoundary(),
            this.world.level.levelEndX - this.width
        );
    }

    /** Moves Pepe right without crossing the configured level boundary. */
    moveRightWithinLevel() {
        this.moveRight();
        if (this.x > this.getRightBoundary()) {
            this.x = this.getRightBoundary();
        }
    }

    /** Moves Pepe left without crossing the configured level boundary. */
    moveLeftWithinLevel() {
        this.moveLeft();
        if (this.x < this.getLeftBoundary()) {
            this.x = this.getLeftBoundary();
        }
    }

    snapToGround() {
        if (this.speedY <= 0 && this.y > 130 && !this.isAboveGround()) {
            this.y = 130;
            this.speedY = 0;
            this.isBossKnockback = false;
        }
    }

    stopSnoringSound() {
        soundHub.stopSnoring();
    }
}
