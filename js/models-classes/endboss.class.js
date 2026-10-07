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
    chargeDamage = 100;

    lastHitTime = 0;
    hitCooldownMs = 400;
    preAlertBottleHits = 0;
    bottleHitsToAlert = 3;

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
        this.lifecycleManager = new EndbossLifecycleManager(this);
        this.combatManager = new EndbossCombatManager(this);
        this.animate();
        this.thunderAttack = new Audio('./assets/sound/thunder-attack.mp3'); this.thunderAttack.preload = 'auto';
    }

    /** Applies level-specific boss strength, position, and timing values. */
    applyLevelConfig(levelConfig) {
        this.maxEnergy = levelConfig.bossEnergy;
        this.energieBoss = levelConfig.bossEnergy;
        this.moveSpeed = levelConfig.bossMoveSpeed;
        this.chargeCooldown = levelConfig.bossChargeCooldown;
        this.chargeSpeed = levelConfig.bossChargeSpeed;
        this.chargeDistance = levelConfig.bossChargeDistance;
        this.chargeDamage = levelConfig.bossChargeDamage;
        this.hitCooldownMs = levelConfig.bossHitCooldown;
        this.minX = levelConfig.bossMinX;
        this.maxX = levelConfig.levelEndX - this.width;
        this.x = Math.max(this.minX, this.maxX - levelConfig.bossRightMargin);
        this.alertX = Math.max(this.minX, this.x - levelConfig.bossAlertDistance);
    }

    /** Delegates recurring boss movement updates to the combat manager. */
    animate() {
        this.combatManager.animate();
    }

    /** Counts accepted pre-fight bottle hits and alerts the boss at the threshold. */
    registerPreAlertBottleHit() {
        this.combatManager.registerPreAlertBottleHit();
    }

    /** Delegates the alert sequence to the combat manager. */
    triggerAlert() {
        this.combatManager.triggerAlert();
    }

    /** Delegates the alert animation to the combat manager. */
    playAlertAnimation(onComplete) {
        this.combatManager.playAlertAnimation(onComplete);
    }

    /** Delegates walking animation updates to the combat manager. */
    startWalkingAnimation() {
        this.combatManager.startWalkingAnimation();
    }

    /** Delegates recurring charge scheduling to the combat manager. */
    startChargeTimer() {
        this.combatManager.startChargeTimer();
    }

    /** Delegates one charge attack to the combat manager. */
    performChargeAttack() {
        this.combatManager.performChargeAttack();
    }

    /** Delegates charge damage and knockback handling to the combat manager. */
    handleChargeHit(moveInterval) {
        this.combatManager.handleChargeHit(moveInterval);
    }

    /** Delegates one bounded charge movement step to the combat manager. */
    moveChargeStep(toRight, attackSpeed) {
        return this.combatManager.moveChargeStep(toRight, attackSpeed);
    }

    /** Returns whether the boss is inside its level-specific post-hit recovery. */
    isInHitRecovery() {
        return Date.now() - this.lastHitTime < this.hitCooldownMs;
    }

    /** Applies one boss hit and reports whether damage was accepted. */
    wasHit() {
        if (this.isDeadBoss || this.isInHitRecovery()) return false;

        this.lastHitTime = Date.now();

        this.energieBoss -= 60;

        if (this.world && this.world.bossBar) {
            let bossHealthPercentage = (this.energieBoss / this.maxEnergy) * 100;
            if (bossHealthPercentage < 0) bossHealthPercentage = 0;
            this.world.bossBar.setPercentage(bossHealthPercentage);
        }

        this.isHurtBoss = true;
        this.playAnimation(this.imagesHurt);
        const boss = this;
        this.world.setManagedTimeout(function () {
            boss.isHurtBoss = false;
        }, 400);

        if (this.energieBoss <= 0) {
            this.die();
        }
        return true;
    }

    /** Delegates the boss death sequence to the lifecycle manager. */
    die() {
        this.lifecycleManager.die();
    }

    /** Delegates animation shutdown to the lifecycle manager. */
    stopAllAnimations() {
        this.lifecycleManager.stopAllAnimations();
    }

    /** Delegates terminal timer and audio cleanup to the lifecycle manager. */
    stopBossAudioAndTimers() {
        this.lifecycleManager.stopBossAudioAndTimers();
    }

    /** Delegates recurring boss-sound cleanup to the lifecycle manager. */
    stopAllBossSounds() {
        this.lifecycleManager.stopAllBossSounds();
    }

    /** Delegates thunder-attack audio cleanup to the lifecycle manager. */
    stopThunderAttackSound() {
        this.lifecycleManager.stopThunderAttackSound();
    }

    /** Delegates Game Over boss cleanup to the lifecycle manager. */
    onGameOverCleanup() {
        this.lifecycleManager.onGameOverCleanup();
    }

    /** Delegates restart/disposal cleanup to the lifecycle manager. */
    forceStopBossAudio() {
        this.lifecycleManager.forceStopBossAudio();
    }

}
