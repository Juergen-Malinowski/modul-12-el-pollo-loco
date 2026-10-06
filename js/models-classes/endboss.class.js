/**
 * Controls end boss movement, attacks, damage states, and shutdown behavior.
 */
class Endboss extends MovableObject {

    heigth = 300;
    width = 300;
    y = 180;
    x = 1750;
    energieBoss = 300;
    maxEnergy = 300;
    moveSpeed = 5.0;
    minX = 400;
    maxX = 1700;
    alertX = 1150;

    isCharging = false;
    chargeInterval = null;
    chargeCooldown = 7000;
    chargeSpeed = 20;
    chargeDistance = 600;

    lastHitTime = 0;
    hitCooldownMs = 400;

    offset = { top: 50, buttom: 10, left: 20, right: 20 };

    imagesWalking = [
        './assets/img/4_feinde_boss_huhn/1_walk/G1.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G2.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G3.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G4.png',
    ];

    imagesAlert = [

        './assets/img/4_feinde_boss_huhn/2_alert/G5.png',
        './assets/img/4_feinde_boss_huhn/2_alert/G6.png',
        './assets/img/4_feinde_boss_huhn/2_alert/G7.png',
        './assets/img/4_feinde_boss_huhn/2_alert/G8.png',
        './assets/img/4_feinde_boss_huhn/2_alert/G9.png',
        './assets/img/4_feinde_boss_huhn/2_alert/G10.png',
        './assets/img/4_feinde_boss_huhn/2_alert/G11.png',
        './assets/img/4_feinde_boss_huhn/2_alert/G12.png',
    ];

    imagesAttack = [

        './assets/img/4_feinde_boss_huhn/3_attack/G13.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G14.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G15.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G16.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G17.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G18.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G19.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G20.png',
    ];

    imagesThunderRun = [

        './assets/img/4_feinde_boss_huhn/3_attack/G17.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G18.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G1.png',
        './assets/img/4_feinde_boss_huhn/3_attack/G18.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G3.png',
    ];

    imagesHurt = [
        './assets/img/4_feinde_boss_huhn/4_hurt/G21.png',
        './assets/img/4_feinde_boss_huhn/4_hurt/G22.png',
        './assets/img/4_feinde_boss_huhn/4_hurt/G23.png',
    ];

    imagesDead = [
        './assets/img/4_feinde_boss_huhn/5_dead/G24.png',
        './assets/img/4_feinde_boss_huhn/5_dead/G25.png',
        './assets/img/4_feinde_boss_huhn/5_dead/G26.png',
    ];

    isAlerted = false;
    isWalking = false;
    isDeadBoss = false;
    isHurtBoss = false;
    alertPlayed = false;

    constructor(levelConfig = getLevelConfig(1)) {
        super().loadImage('./assets/img/4_feinde_boss_huhn/2_alert/G5.png');
        this.applyLevelConfig(levelConfig);
        this.loadImages(this.imagesWalking);
        this.loadImages(this.imagesAlert);
        this.loadImages(this.imagesAttack);
        this.loadImages(this.imagesThunderRun);
        this.loadImages(this.imagesHurt);
        this.loadImages(this.imagesDead);
        this.animate();
        this.thunderAttack = new Audio('./assets/sound/thunder-attack.mp3'); this.thunderAttack.preload = 'auto';
    }

    /** Applies level-specific boss strength, position, and timing values. */
    applyLevelConfig(levelConfig) {
        this.maxEnergy = levelConfig.bossEnergy;
        this.energieBoss = levelConfig.bossEnergy;
        this.moveSpeed = levelConfig.bossMoveSpeed;
        this.chargeCooldown = levelConfig.bossChargeCooldown;
        this.hitCooldownMs = levelConfig.bossHitCooldown;
        this.minX = levelConfig.bossMinX;
        this.maxX = levelConfig.levelEndX - this.width;
        this.x = Math.max(this.minX, this.maxX - levelConfig.bossRightMargin);
        this.alertX = Math.max(this.minX, this.x - levelConfig.bossAlertDistance);
    }

    animate() {

        if (this.animateInterval) clearInterval(this.animateInterval);
        this.animateInterval = soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (this.isDeadBoss || (this.world && this.world.gameOver)) {
                clearInterval(this.animateInterval);
                this.animateInterval = null;
                return;
            }
            if (this.world && this.world.character) {
                if (!this.isAlerted && this.world.character.x >= this.alertX) {
                    this.triggerAlert();
                }
            }
            if (this.isWalking && this.world && this.world.character && !this.isCharging) {
                const pepe = this.world.character;
                const levelRight = (this.world.level && typeof this.world.level.levelEndX === "number")
                    ? (this.world.level.levelEndX - this.width)
                    : this.maxX;
                const leftBound = (typeof this.minX === "number") ? this.minX : 0;
                const rightBound = Math.max(leftBound, Math.min(this.maxX, levelRight));

                if (pepe.x < this.x) {
                    this.otherDirection = false;
                    this.x -= this.moveSpeed;
                } else {
                    this.otherDirection = true;
                    this.x += this.moveSpeed;
                }

                if (this.x < leftBound) {
                    this.x = leftBound;
                    this.otherDirection = true;
                } else if (this.x > rightBound) {
                    this.x = rightBound;
                    this.otherDirection = false;
                }
            }
        }, 100));
    }

    triggerAlert() {

        this.isAlerted = true;

        var self = this;
        this.screamInterval = soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;

            if (
                !self.isDeadBoss &&
                self.isAlerted &&
                self.world &&
                !self.world.gameOver
            ) {
                soundHub.playEffect(soundHub.soundBossStart);
            } else {

                if (this.world && typeof this.world.stopAllGameProcesses === "function") {
                    this.world.stopAllGameProcesses();
                }
                clearInterval(self.screamInterval);
                self.screamInterval = null;
                if (typeof soundHub !== "undefined" && soundHub.soundBossStart) {
                    soundHub.stopEffect(soundHub.soundBossStart);
                }
            }
        }, 7000));

        soundHub.playEffect(soundHub.soundBossStart);

        this.playAlertAnimation(function () {

            self.isWalking = true;
            self.startWalkingAnimation();

            self.performChargeAttack();

            self.startChargeTimer();
        });
    }

    playAlertAnimation(onComplete) {
        let i = 0;
        const alertInterval = soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (i < this.imagesAlert.length) {
                const path = this.imagesAlert[i];
                this.img = this.imageCache[path];
                i++;
            } else {
                clearInterval(alertInterval);
                if (onComplete) onComplete();
            }
        }, 200));
    }

    startWalkingAnimation() {
        soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (this.isWalking && !this.isDeadBoss && !this.isCharging) {
                this.playAnimation(this.imagesWalking);
            }
        }, 200));
    }

    startChargeTimer() {
        if (this.chargeInterval) clearInterval(this.chargeInterval);

        this.chargeInterval = soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (this.isDeadBoss) {
                clearInterval(this.chargeInterval);
                return;
            }
            if (this.isAlerted && !this.isCharging) {
                this.performChargeAttack();
            }
        }, this.chargeCooldown));
    }

    /**
     * Charges toward Pepe and keeps the boss on the side where the charge ends.
     */
    performChargeAttack() {
        if (!this.world || !this.world.character) return;

        this.isCharging = true;
        const pepe = this.world.character;
        const toRight = (pepe.x > this.x);
        this.otherDirection = toRight;

        soundHub.playEffect(soundHub.soundBossCharge);

        const attackSpeed = this.chargeSpeed;
        const targetDistance = this.chargeDistance;
        let traveled = 0;

        this.playAnimation(this.imagesThunderRun);

        const moveInterval = soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (this.isDeadBoss) {
                clearInterval(moveInterval);
                this.isCharging = false;
                return;
            }

            const reachedBoundary = this.moveChargeStep(toRight, attackSpeed);
            traveled += Math.abs(attackSpeed);

            if (this.world.character.isColliding(this)) {
                this.handleChargeHit(moveInterval);
                return;
            }

            if (traveled >= targetDistance || reachedBoundary) {
                clearInterval(moveInterval);
                this.isCharging = false;
                this.world.addScore(this.world.levelConfig.score.bossChargeDodge);
            }
        }, 40));
    }

    /** Applies charge damage and one pre-resolved safe knockback to Pepe. */
    handleChargeHit(moveInterval) {
        const character = this.world.character;
        character.energie = Math.max(0, character.energie - 100);
        const percent = character.energie / character.holeEnergie * 100;
        this.world.statusBar.setPercentage(percent);
        soundHub.playEffect(soundHub.soundHit);
        if (!character.isDead()) this.world.collisionManager.applyBossAttackKnockback(this);
        clearInterval(moveInterval);
        this.isCharging = false;
    }

    /** Moves one charge step and keeps the boss completely inside the level. */
    moveChargeStep(toRight, attackSpeed) {
        const direction = toRight ? 1 : -1;
        const nextX = this.x + attackSpeed * direction;
        const leftBound = this.minX;
        const rightBound = Math.min(this.maxX, this.world.level.levelEndX - this.width);
        this.x = Math.max(leftBound, Math.min(rightBound, nextX));
        return this.x === leftBound || this.x === rightBound;
    }

    wasHit() {
        if (this.isDeadBoss) return;

        let now = Date.now();
        if (now - this.lastHitTime < this.hitCooldownMs) return;
        this.lastHitTime = now;

        this.energieBoss -= 60;

        if (this.world && this.world.bossBar) {
            let bossHealthPercentage = (this.energieBoss / this.maxEnergy) * 100;
            if (bossHealthPercentage < 0) bossHealthPercentage = 0;
            this.world.bossBar.setPercentage(bossHealthPercentage);
        }

        this.isHurtBoss = true;
        this.playAnimation(this.imagesHurt);
        this.world.setManagedTimeout(() => this.isHurtBoss = false, 400);

        if (this.energieBoss <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isDeadBoss) return;
        if (this.world && typeof this.world.stopAllGameProcesses === "function") {
            this.world.stopAllGameProcesses();
        }
        this.stopAllBossSounds();
        this.isDeadBoss = true;
        this.isWalking = false;
        this.isAlerted = false;
        this.isCharging = false;

        if (this.chargeInterval) clearInterval(this.chargeInterval);

        let i = 0;
        const deathInterval = soundHub.registerInterval(setInterval(() => {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (i < this.imagesDead.length) {
                this.img = this.imageCache[this.imagesDead[i]];
                i++;
            } else {
                clearInterval(deathInterval);
                const lastFrame = this.imageCache[this.imagesDead[this.imagesDead.length - 1]];
                if (lastFrame) this.img = lastFrame;
                this.stopBossAudioAndTimers();
                this.stopAllAnimations();
                if (this.world) {
                    this.world.setManagedTimeout(() => {
                        if (typeof this.world.freezeWorld === "function") {
                            this.world.freezeWorld();
                        }
                        this.world.addScore(this.world.levelConfig.score.bossKill);
                        this.world.handleBossDefeat();
                    }, 1000);
                }
            }
        }, 250));
        this.stopThunderAttackSound();
    }

    stopAllAnimations() {
        this.isWalking = false;
        this.isAlerted = false;
        this.isHurtBoss = false;
        this.speed = 0;
        this.acceleration = 0;
        this.stopAllBossSounds();
    }

    /**
     * Stops boss-specific timers and audio during terminal game states.
     */
    stopBossAudioAndTimers() {
    try {

        if (this.world && typeof this.world.stopAllGameProcesses === "function") {
            this.world.stopAllGameProcesses();
        }

        if (this.screamInterval) {
            clearInterval(this.screamInterval);
            this.screamInterval = null;
        }
        if (this.thunderAttackTimer) {
            clearInterval(this.thunderAttackTimer);
            this.thunderAttackTimer = null;
        }
        if (this.thunderRunAnimInterval) {
            clearInterval(this.thunderRunAnimInterval);
            this.thunderRunAnimInterval = null;
        }
        if (this.walkAnimInterval) {
            clearInterval(this.walkAnimInterval);
            this.walkAnimInterval = null;
        }

        if (typeof soundHub !== "undefined" && soundHub) {
            if (soundHub.soundBossStart) {
                soundHub.stopEffect(soundHub.soundBossStart);
            }
            if (soundHub.soundBossCharge) {
                soundHub.stopEffect(soundHub.soundBossCharge);
            }

            if (typeof soundHub.stopAllAudio === "function") {
                soundHub.stopAllAudio();
            }
        }
    } catch (e) {
        console.warn("Failed to stop boss audio and timers:", e);
    }
}

    /**
     * Stops recurring boss timers and currently playing boss sounds.
     */
    stopAllBossSounds() {

        if (this.screamInterval) {
            clearInterval(this.screamInterval);
            this.screamInterval = null;
        }
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }

        try {
            if (soundHub && !soundHub.isMuted) {
                const effects = soundHub.getAllEffects();
                for (let i = 0; i < effects.length; i++) {
                    if (effects[i] && !effects[i].paused) {
                        effects[i].pause();
                        effects[i].currentTime = 0;
                    }
                }
            }
        } catch (err) { }
        this.stopThunderAttackSound();
    }

    /**
     * Stops the boss-owned thunder attack audio instance.
     */
    stopThunderAttackSound() {
        try {
            if (this.thunderAttack) {
                this.thunderAttack.pause();
                this.thunderAttack.currentTime = 0;
            }
        } catch (e) { }
    }

    /**
     * Resets boss state and stops boss activity after the player loses.
     */
    onGameOverCleanup() {
        try {
            this.isAlerted = false;
            this.isWalking = false;
            this.isHurtBoss = false;
            this.isCharging = false;
            this.isDeadBoss = true;

            if (this.world && typeof this.world.stopAllGameProcesses === "function") {
                this.world.stopAllGameProcesses();
            }
            if (this.animateInterval) {
                clearInterval(this.animateInterval);
                this.animateInterval = null;
            }
            if (this.screamInterval) {
                clearInterval(this.screamInterval);
                this.screamInterval = null;
            }
            if (this.chargeInterval) {
                clearInterval(this.chargeInterval);
                this.chargeInterval = null;
            }
            this.stopAllBossSounds();
            this.stopBossAudioAndTimers();

            if (typeof soundHub !== "undefined") {
                soundHub.stopEffect(soundHub.soundBossStart);
                soundHub.stopEffect(soundHub.soundBossCharge);
            }
        } catch (e) { };
        if (this.screamInterval) {
            clearInterval(this.screamInterval);
            this.screamInterval = null;
        };
        if (typeof soundHub !== "undefined") {
            soundHub.stopEffect(soundHub.soundBossStart);
            soundHub.stopEffect(soundHub.soundBossCharge);
        };
        this.stopThunderAttackSound();
    }

    /**
     * Performs an idempotent hard stop before a World is restarted or discarded.
     */
    forceStopBossAudio() {
        try {

            if (this.screamInterval) { clearInterval(this.screamInterval); this.screamInterval = null; }
            if (this.chargeInterval) { clearInterval(this.chargeInterval); this.chargeInterval = null; }
            if (this.animateInterval) { clearInterval(this.animateInterval); this.animateInterval = null; }

            this.isAlerted = false;
            this.isWalking = false;
            this.isCharging = false;
            this.isDeadBoss = true;

            this.stopThunderAttackSound();

            if (typeof soundHub !== "undefined" && typeof soundHub.stopBossCharge === "function") {
                soundHub.stopBossCharge();
            }

        } catch (e) {
            console.warn("Failed to stop boss audio completely:", e);
        }
    }
}
