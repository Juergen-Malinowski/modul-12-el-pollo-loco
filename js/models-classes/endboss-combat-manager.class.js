/**
 * Controls Endboss pursuit, alert behavior, and charge attacks.
 */
class EndbossCombatManager {
    constructor(boss) {
        this.boss = boss;
    }

    /** Starts the recurring boss movement and proximity-alert loop. */
    animate() {
        const boss = this.boss;
        if (boss.animateInterval) clearInterval(boss.animateInterval);
        const manager = this;
        boss.animateInterval = soundHub.registerInterval(setInterval(function () {
            manager.updateBossState();
        }, 100));
    }

    /** Updates proximity alert and pursuit movement for one boss tick. */
    updateBossState() {
        if (typeof isGamePaused === "function" && isGamePaused()) return;
        if (this.stopAnimateLoopIfTerminal()) return;
        this.triggerProximityAlert();
        this.updatePursuitMovement();
    }

    /** Stops the main boss loop once combat can no longer continue. */
    stopAnimateLoopIfTerminal() {
        const boss = this.boss;
        if (!boss.isDeadBoss && !(boss.world && boss.world.gameOver)) return false;
        clearInterval(boss.animateInterval);
        boss.animateInterval = null;
        return true;
    }

    /** Alerts the boss when Pepe reaches the configured trigger position. */
    triggerProximityAlert() {
        const boss = this.boss;
        if (!boss.world || !boss.world.character || boss.isAlerted) return;
        if (boss.world.character.x >= boss.alertX) this.triggerAlert();
    }

    /** Moves the walking boss toward Pepe inside the configured level bounds. */
    updatePursuitMovement() {
        const boss = this.boss;
        if (!this.canPursuePepe()) return;
        const bounds = this.getMovementBounds();
        this.moveTowardPepe(boss.world.character);
        this.keepBossInsideBounds(bounds);
    }

    /** Returns whether normal pursuit movement is currently allowed. */
    canPursuePepe() {
        const boss = this.boss;
        return boss.isWalking &&
            boss.world &&
            boss.world.character &&
            !boss.isCharging;
    }

    /** Returns the effective horizontal movement limits for the active level. */
    getMovementBounds() {
        const boss = this.boss;
        const levelRight = boss.world.level &&
            typeof boss.world.level.levelEndX === "number"
            ? boss.world.level.levelEndX - boss.width
            : boss.maxX;
        const left = typeof boss.minX === "number" ? boss.minX : 0;
        return {
            left: left,
            right: Math.max(left, Math.min(boss.maxX, levelRight)),
        };
    }

    /** Moves one pursuit step toward Pepe and updates sprite direction. */
    moveTowardPepe(pepe) {
        const boss = this.boss;
        if (pepe.x < boss.x) {
            boss.otherDirection = false;
            boss.x -= boss.moveSpeed;
            return;
        }
        boss.otherDirection = true;
        boss.x += boss.moveSpeed;
    }

    /** Clamps pursuit movement and faces the boss back into the level. */
    keepBossInsideBounds(bounds) {
        const boss = this.boss;
        if (boss.x < bounds.left) {
            boss.x = bounds.left;
            boss.otherDirection = true;
        } else if (boss.x > bounds.right) {
            boss.x = bounds.right;
            boss.otherDirection = false;
        }
    }

    /** Counts accepted pre-fight bottle hits and alerts at the threshold. */
    registerPreAlertBottleHit() {
        const boss = this.boss;
        if (boss.isAlerted || boss.isDeadBoss) return;
        boss.preAlertBottleHits++;
        if (boss.preAlertBottleHits >= boss.bottleHitsToAlert) this.triggerAlert();
    }

    /** Starts the boss alert sound, animation, and active fight sequence. */
    triggerAlert() {
        const boss = this.boss;
        if (boss.isAlerted || boss.isDeadBoss) return;
        boss.isAlerted = true;
        this.startScreamTimer();
        soundHub.playEffect(soundHub.soundBossStart);
        const manager = this;
        this.playAlertAnimation(function () {
            manager.startActiveFight();
        });
    }

    /** Starts the recurring boss-start scream while the fight remains active. */
    startScreamTimer() {
        const manager = this;
        this.boss.screamInterval = soundHub.registerInterval(setInterval(function () {
            manager.updateScreamLoop();
        }, 7000));
    }

    /** Plays the recurring scream or stops it after combat has ended. */
    updateScreamLoop() {
        if (typeof isGamePaused === "function" && isGamePaused()) return;
        if (this.canPlayBossScream()) {
            soundHub.playEffect(soundHub.soundBossStart);
            return;
        }
        this.stopScreamLoop();
    }

    /** Returns whether the recurring boss-start scream may continue. */
    canPlayBossScream() {
        const boss = this.boss;
        return !boss.isDeadBoss &&
            boss.isAlerted &&
            boss.world &&
            !boss.world.gameOver;
    }

    /** Stops the recurring scream and preserves the existing terminal cleanup. */
    stopScreamLoop() {
        const boss = this.boss;
        if (boss.world && typeof boss.world.stopAllGameProcesses === "function") {
            boss.world.stopAllGameProcesses();
        }
        clearInterval(boss.screamInterval);
        boss.screamInterval = null;
        if (typeof soundHub !== "undefined" && soundHub.soundBossStart) {
            soundHub.stopEffect(soundHub.soundBossStart);
        }
    }

    /** Plays every alert frame before invoking the fight callback. */
    playAlertAnimation(onComplete) {
        const boss = this.boss;
        let frameIndex = 0;
        const alertInterval = soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (frameIndex < boss.imagesAlert.length) {
                boss.img = boss.imageCache[boss.imagesAlert[frameIndex]];
                frameIndex++;
                return;
            }
            clearInterval(alertInterval);
            if (onComplete) onComplete();
        }, 200));
    }

    /** Enables pursuit and starts the first charge plus recurring charge timer. */
    startActiveFight() {
        const boss = this.boss;
        boss.isWalking = true;
        this.startWalkingAnimation();
        this.performChargeAttack();
        this.startChargeTimer();
    }

    /** Starts recurring walking frames whenever the boss is not charging. */
    startWalkingAnimation() {
        const boss = this.boss;
        soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            if (boss.isWalking && !boss.isDeadBoss && !boss.isCharging) {
                boss.playAnimation(boss.imagesWalking);
            }
        }, 200));
    }

    /** Schedules recurring charge attacks using the configured cooldown. */
    startChargeTimer() {
        const boss = this.boss;
        if (boss.chargeInterval) clearInterval(boss.chargeInterval);
        const manager = this;
        boss.chargeInterval = soundHub.registerInterval(setInterval(function () {
            manager.updateChargeTimer();
        }, boss.chargeCooldown));
    }

    /** Starts the next charge when the recurring timer allows it. */
    updateChargeTimer() {
        const boss = this.boss;
        if (typeof isGamePaused === "function" && isGamePaused()) return;
        if (boss.isDeadBoss) {
            clearInterval(boss.chargeInterval);
            return;
        }
        if (boss.isAlerted && !boss.isCharging) this.performChargeAttack();
    }

    /** Starts one charge toward Pepe using the configured speed and distance. */
    performChargeAttack() {
        const boss = this.boss;
        if (!boss.world || !boss.world.character) return;
        boss.isCharging = true;
        const state = this.createChargeState();
        boss.otherDirection = state.toRight;
        soundHub.playEffect(soundHub.soundBossCharge);
        boss.playAnimation(boss.imagesThunderRun);
        this.startChargeMovement(state);
    }

    /** Creates the mutable state used for one charge sequence. */
    createChargeState() {
        const boss = this.boss;
        return {
            toRight: boss.world.character.x > boss.x,
            attackSpeed: boss.chargeSpeed,
            targetDistance: boss.chargeDistance,
            traveled: 0,
        };
    }

    /** Starts the recurring movement ticks for one charge sequence. */
    startChargeMovement(state) {
        const manager = this;
        const moveInterval = soundHub.registerInterval(setInterval(function () {
            manager.updateChargeMovement(state, moveInterval);
        }, 40));
    }

    /** Advances one charge tick and resolves hit, dodge, or boundary completion. */
    updateChargeMovement(state, moveInterval) {
        if (typeof isGamePaused === "function" && isGamePaused()) return;
        if (this.stopChargeIfBossDead(moveInterval)) return;
        const reachedBoundary = this.moveChargeStep(state.toRight, state.attackSpeed);
        state.traveled += Math.abs(state.attackSpeed);
        if (this.resolveChargeHit(moveInterval)) return;
        if (state.traveled >= state.targetDistance || reachedBoundary) {
            this.finishDodgedCharge(moveInterval);
        }
    }

    /** Stops the current charge immediately when the boss has died. */
    stopChargeIfBossDead(moveInterval) {
        if (!this.boss.isDeadBoss) return false;
        clearInterval(moveInterval);
        this.boss.isCharging = false;
        return true;
    }

    /** Applies charge damage when Pepe collides outside hit recovery. */
    resolveChargeHit(moveInterval) {
        const boss = this.boss;
        const character = boss.world.character;
        if (!character.isColliding(boss) || boss.isInHitRecovery()) return false;
        this.handleChargeHit(moveInterval);
        return true;
    }

    /** Finishes a missed charge and awards its dodge score. */
    finishDodgedCharge(moveInterval) {
        const boss = this.boss;
        clearInterval(moveInterval);
        boss.isCharging = false;
        boss.world.addScore(boss.world.levelConfig.score.bossChargeDodge);
    }

    /** Applies charge damage and one pre-resolved safe knockback to Pepe. */
    handleChargeHit(moveInterval) {
        const boss = this.boss;
        const character = boss.world.character;
        character.energie = Math.max(0, character.energie - boss.chargeDamage);
        const percent = character.energie / character.holeEnergie * 100;
        boss.world.statusBar.setPercentage(percent);
        soundHub.playEffect(soundHub.soundHit);
        if (!character.isDead()) boss.world.collisionManager.applyBossAttackKnockback(boss);
        clearInterval(moveInterval);
        boss.isCharging = false;
    }

    /** Moves one charge step and keeps the boss completely inside the level. */
    moveChargeStep(toRight, attackSpeed) {
        const boss = this.boss;
        const direction = toRight ? 1 : -1;
        const nextX = boss.x + attackSpeed * direction;
        const leftBound = boss.minX;
        const rightBound = Math.min(boss.maxX, boss.world.level.levelEndX - boss.width);
        boss.x = Math.max(leftBound, Math.min(rightBound, nextX));
        return boss.x === leftBound || boss.x === rightBound;
    }
}
