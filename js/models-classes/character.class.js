
console.log("Character-Klasse geladen, SoundHub:", typeof soundHub);

/**
 * ===========================================================
 *  CHARAKTER-KLASSE "PEPE"
 *  ------------------------
 *  Steuerung der Spielfigur, Animationen und Bewegungen
 *  Soundeffekte (z. B. Schnarchen) werden zentral über SoundHub verwaltet
 * ===========================================================
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

    offset = {
        top: 130,
        buttom: 10,
        left: 40,
        right: 40,
    };

    // === ANIMATIONS-BILDER ===
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

    animate() {
        if (this.isThrowing) return;

        // === BEWEGUNGS-STEUERUNG ===
        soundHub.registerInterval(setInterval(() => {
            if (this.isDeadAnimationPlaying) {
                return;
            }

            if (this.world.keyboard.RIGHT && this.x < this.world.level.levelEndX) {
                this.moveRight();
                this.otherDirection = false;
                this.lastActionTime = Date.now();
                soundHub.stopSnoring(); // sicherheitshalber beenden, wenn Spieler wieder aktiv wird
            }

            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();
                this.otherDirection = true;
                this.lastActionTime = Date.now();
                soundHub.stopSnoring();
            }

            if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                soundHub.playEffect(soundHub.soundJumping);
                this.speedY = 45;
                this.lastActionTime = Date.now();
                soundHub.stopSnoring();
            }

            if (!this.isAboveGround() && this.speedY <= 0) {
                this.snapToGround();
            }

            this.world.cameraX = -this.x + 200;
        }, 100));

        // === ANIMATIONS-STEUERUNG ===
        soundHub.registerInterval(setInterval(() => {
            if (this.isDead() && !this.isDeadAnimationPlaying) {
                this.isDeadAnimationPlaying = true;
                soundHub.stopSnoring();
                this.playDeadAnimation();
                return;
            }

            if (this.isDeadAnimationPlaying) {
                return;
            }

            if (this.isHurt()) {
                soundHub.stopSnoring();
                this.lastActionTime = Date.now();
                this.playAnimation(this.imagesHurt);
                return;
            }

            if (this.isAboveGround()) {
                this.playAnimation(this.imagesJumping);
            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.imagesWalking);
            } else {
                // === IDLE-STEUERUNG ===
                const idleTime = (Date.now() - this.lastActionTime) / 1000;

                if (idleTime < 3) {
                    this.playAnimation(this.imagesWating);
                    soundHub.stopSnoring();
                } else if (idleTime >= 5) {
                    this.playAnimation(this.imagesLongWaiting);

                    // ✅ WICHTIG: nur starten, wenn noch nicht laufend
                    if (!soundHub.snoringAudio || soundHub.snoringAudio.paused) {
                        soundHub.playSnoring();
                    }
                } else {
                    // 3–5 Sekunden: normal idle → kein Schnarchen
                    soundHub.stopSnoring();
                }
            }
        }, 150));
    }

    playDeadAnimation() {
        this.speedY = 0;
        this.acceleration = 0;

        let i = 0;
        const deathInterval = soundHub.registerInterval(setInterval(() => {
            if (i < this.imagesDead.length) {
                const path = this.imagesDead[i];
                this.img = this.imageCache[path];
                i++;
            } else {
                setTimeout(() => {
                    clearInterval(deathInterval);
                    this.img = this.imageCache[this.imagesDead[this.imagesDead.length - 1]];
                }, 200);
            }
        }, 200));

        setTimeout(() => {
            // später Restart-Button
        }, 2000);

        if (this.world) {
            setTimeout(() => {
                this.world.startCoffinAnimation();
            }, 1000);
        }
    }

    playThrowAnimation() {
        this.lastActionTime = Date.now();
        this.isThrowing = true;
        setTimeout(() => this.isThrowing = false, 400);
        if (this.isDeadAnimationPlaying) return;

        let i = 0;
        const throwInterval = soundHub.registerInterval(setInterval(() => {
            if (i < this.imagesThrowing.length) {
                const path = this.imagesThrowing[i];
                this.img = this.imageCache[path];
                i++;
            } else {
                clearInterval(throwInterval);
            }
        }, 20));
    }

    snapToGround() {
        if (this.speedY <= 0 && this.y > 130 && !this.isAboveGround()) {
            this.y = 130;
            this.speedY = 0;
        }
    }

    stopSnoringSound() {
        soundHub.stopSnoring();
    }
}
