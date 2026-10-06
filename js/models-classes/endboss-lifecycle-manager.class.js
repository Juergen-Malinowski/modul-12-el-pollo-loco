/**
 * Handles Endboss death, terminal cleanup, timers, and boss-owned audio.
 */
class EndbossLifecycleManager {
    constructor(boss) {
        this.boss = boss;
    }

    /** Starts the final boss death sequence once. */
    die() {
        if (this.boss.isDeadBoss) return;
        this.prepareDeathState();
        this.startDeathAnimation();
        this.stopThunderAttackSound();
    }

    /** Stops active gameplay and marks the boss as terminal. */
    prepareDeathState() {
        const boss = this.boss;
        if (boss.world && typeof boss.world.stopAllGameProcesses === "function") {
            boss.world.stopAllGameProcesses();
        }
        this.stopAllBossSounds();
        boss.isDeadBoss = true;
        boss.isWalking = false;
        boss.isAlerted = false;
        boss.isCharging = false;
        this.clearBossInterval("chargeInterval");
    }

    /** Plays the boss death frames until the last frame is reached. */
    startDeathAnimation() {
        const manager = this;
        let frameIndex = 0;
        const deathInterval = soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            frameIndex = manager.playDeathFrame(frameIndex, deathInterval);
        }, 250));
    }

    /** Advances one death frame and returns the next frame index. */
    playDeathFrame(frameIndex, deathInterval) {
        const boss = this.boss;
        if (frameIndex < boss.imagesDead.length) {
            boss.img = boss.imageCache[boss.imagesDead[frameIndex]];
            return frameIndex + 1;
        }
        this.finishDeathAnimation(deathInterval);
        return frameIndex;
    }

    /** Finalizes the death animation and schedules level completion. */
    finishDeathAnimation(deathInterval) {
        const boss = this.boss;
        clearInterval(deathInterval);
        const lastFrame = boss.imageCache[boss.imagesDead[boss.imagesDead.length - 1]];
        if (lastFrame) boss.img = lastFrame;
        this.stopBossAudioAndTimers();
        this.stopAllAnimations();
        this.scheduleBossDefeat();
    }

    /** Adds the boss kill score and routes the completed boss fight. */
    scheduleBossDefeat() {
        const boss = this.boss;
        if (!boss.world) return;
        boss.world.setManagedTimeout(function () {
            if (typeof boss.world.freezeWorld === "function") boss.world.freezeWorld();
            boss.world.addScore(boss.world.levelConfig.score.bossKill);
            boss.world.handleBossDefeat();
        }, 1000);
    }

    /** Stops boss movement and all recurring boss sounds. */
    stopAllAnimations() {
        const boss = this.boss;
        boss.isWalking = false;
        boss.isAlerted = false;
        boss.isHurtBoss = false;
        boss.speed = 0;
        boss.acceleration = 0;
        this.stopAllBossSounds();
    }

    /** Stops terminal boss timers and shared audio activity. */
    stopBossAudioAndTimers() {
        try {
            this.stopWorldProcesses();
            this.clearTerminalIntervals();
            this.stopBossEffects();
            if (typeof soundHub !== "undefined" &&
                typeof soundHub.stopAllAudio === "function") {
                soundHub.stopAllAudio();
            }
        } catch (error) {
            console.warn("Failed to stop boss audio and timers:", error);
        }
    }

    /** Stops World-owned processes when a terminal boss state is reached. */
    stopWorldProcesses() {
        const world = this.boss.world;
        if (world && typeof world.stopAllGameProcesses === "function") {
            world.stopAllGameProcesses();
        }
    }

    /** Clears boss timers that may survive the active combat sequence. */
    clearTerminalIntervals() {
        this.clearBossInterval("screamInterval");
        this.clearBossInterval("thunderAttackTimer");
        this.clearBossInterval("thunderRunAnimInterval");
        this.clearBossInterval("walkAnimInterval");
    }

    /** Stops recurring boss timers and currently playing boss sounds. */
    stopAllBossSounds() {
        this.clearBossInterval("screamInterval");
        this.clearBossInterval("chargeInterval");
        this.pauseActiveEffects();
        this.stopThunderAttackSound();
    }

    /** Pauses active SoundHub effects exactly as the previous boss cleanup did. */
    pauseActiveEffects() {
        try {
            if (typeof soundHub === "undefined" || !soundHub || soundHub.isMuted) return;
            const effects = soundHub.getAllEffects();
            for (let i = 0; i < effects.length; i++) {
                if (!effects[i] || effects[i].paused) continue;
                effects[i].pause();
                effects[i].currentTime = 0;
            }
        } catch (error) { }
    }

    /** Stops the boss-owned thunder attack audio instance. */
    stopThunderAttackSound() {
        try {
            const thunderAttack = this.boss.thunderAttack;
            if (!thunderAttack) return;
            thunderAttack.pause();
            thunderAttack.currentTime = 0;
        } catch (error) { }
    }

    /** Resets boss state and stops boss activity after the player loses. */
    onGameOverCleanup() {
        try {
            this.markBossAsStopped();
            this.stopWorldProcesses();
            this.clearBossInterval("animateInterval");
            this.stopAllBossSounds();
            this.stopBossAudioAndTimers();
            this.stopBossEffects();
            this.stopThunderAttackSound();
        } catch (error) { }
    }

    /** Marks the boss as inactive for terminal cleanup. */
    markBossAsStopped() {
        const boss = this.boss;
        boss.isAlerted = false;
        boss.isWalking = false;
        boss.isHurtBoss = false;
        boss.isCharging = false;
        boss.isDeadBoss = true;
    }

    /** Performs an idempotent hard stop before restart or disposal. */
    forceStopBossAudio() {
        try {
            this.clearBossInterval("screamInterval");
            this.clearBossInterval("chargeInterval");
            this.clearBossInterval("animateInterval");
            this.markBossAsStopped();
            this.stopThunderAttackSound();
            if (typeof soundHub !== "undefined" &&
                typeof soundHub.stopBossCharge === "function") {
                soundHub.stopBossCharge();
            }
        } catch (error) {
            console.warn("Failed to stop boss audio completely:", error);
        }
    }

    /** Stops SoundHub effects used by the boss encounter. */
    stopBossEffects() {
        if (typeof soundHub === "undefined" || !soundHub) return;
        if (soundHub.soundBossStart) soundHub.stopEffect(soundHub.soundBossStart);
        if (soundHub.soundBossCharge) soundHub.stopEffect(soundHub.soundBossCharge);
    }

    /** Clears one interval stored directly on the Endboss instance. */
    clearBossInterval(property) {
        const boss = this.boss;
        if (!boss[property]) return;
        clearInterval(boss[property]);
        boss[property] = null;
    }
}
