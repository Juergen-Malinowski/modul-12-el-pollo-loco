class Endboss extends MovableObject {

    heigth = 300;             // Höhe Endboss
    width = 300;              // Breite Endboss
    y = 180;                  // Startposition Endboss auf der Y-Achse
    x = 1750;                 // Startposition Endboss auf der X-Achse
    energieBoss = 300;        // Lebens-ENERGIE Endboss
    moveSpeed = 5.0;          // Grundgeschwindigkeit Endboss
    minX = 400;               // linke Grenze (innerhalb des Levels)
    maxX = 2100;              // rechte Grenze (innerhalb des Levels)

    // === NEU: Parameter für Spezialangriff (Blitzangriff) ===
    isCharging = false;       // führt der Endboss gerade den Blitzangriff aus?
    chargeInterval = null;    // Timer für periodischen Spezialangriff
    chargeCooldown = 7000;    // Zeitabstand zwischen zwei Blitzangriffen (ms)
    chargeSpeed = 20;         // Bewegungsgeschwindigkeit während Blitzangriff
    chargeDistance = 600;     // Laufstrecke des Blitzangriffs in Pixeln

    // kurzer Hit-Cooldown, damit Endboss pro Flasche nur einmal Schaden erhält ...
    lastHitTime = 0;          // Zeitstempel des letzten gültigen Treffers
    hitCooldownMs = 400;      // Dauer der Kurz-Unverwundbarkeit in Millisekunden

    offset = { top: 50, buttom: 10, left: 20, right: 20 };

    // === BILDER ===
    imagesWalking = [
        './assets/img/4_feinde_boss_huhn/1_walk/G1.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G2.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G3.png',
        './assets/img/4_feinde_boss_huhn/1_walk/G4.png',
    ];

    imagesAlert = [
        // Endboss wurde durch Pepe alamiert ...
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
        // Endboss greift an ...
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
        // Sturmlauf-Angriff ...
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

    // Zustands-Flags bei Spielstart ...
    isAlerted = false;
    isWalking = false;
    isDeadBoss = false;      // Endboss tot?
    isHurtBoss = false;      // gerade getroffen?
    alertPlayed = false;

    constructor() {
        super().loadImage('./assets/img/4_feinde_boss_huhn/2_alert/G5.png');
        this.loadImages(this.imagesWalking);
        this.loadImages(this.imagesAlert);
        this.loadImages(this.imagesAttack);
        this.loadImages(this.imagesThunderRun);
        this.loadImages(this.imagesHurt);
        this.loadImages(this.imagesDead);
        this.animate();
        this.thunderAttack = new Audio('./assets/sound/thunder-attack.mp3'); this.thunderAttack.preload = 'auto';
    }

    animate() {
        // Global stoppbarer Intervall für Bossbewegung ...
        if (this.animateInterval) clearInterval(this.animateInterval);
        this.animateInterval = setInterval(() => {
            if (this.isDeadBoss || (this.world && this.world.gameOver)) {
                clearInterval(this.animateInterval);
                this.animateInterval = null;
                return;
            }
            if (this.world && this.world.character) {
                if (!this.isAlerted && this.world.character.x >= 1400) {
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
        }, 100);
    }

    triggerAlert() {
        // Endboss wurde alarmiert und greift nun Charakter aktiv an ...
        this.isAlerted = true;
        // wiederkehrender Schrei alle 7 Sekunden ...
        var self = this;
        this.screamInterval = setInterval(function () {
            // Neuer Sicherheits-Check ...
            if (
                !self.isDeadBoss &&
                self.isAlerted &&
                self.world &&
                !self.world.gameOver
            ) {
                soundHub.playEffect(soundHub.soundBossStart);
            } else {
                // Intervall endgültig stoppen und Sound abwürgen ...
                clearInterval(self.screamInterval);
                self.screamInterval = null;
                if (typeof soundHub !== "undefined" && soundHub.soundBossStart) {
                    soundHub.stopEffect(soundHub.soundBossStart);
                }
            }
        }, 7000);


        // Erster Schrei sofort ...
        soundHub.playEffect(soundHub.soundBossStart);
        // Alarmanimation starten ...
        this.playAlertAnimation(function () {
            // Nach Abschluss → in den Walk-Modus wechseln ...
            self.isWalking = true;
            self.startWalkingAnimation();
            // Sofort erster Blitzangriff nach Alarmierung ...
            self.performChargeAttack();
            // Danach regulärer Timer für Wiederholung Sturmangriff ...
            self.startChargeTimer();
        });
    }

    playAlertAnimation(onComplete) {
        let i = 0;
        const interval = setInterval(() => {
            if (i < this.imagesAlert.length) {
                const path = this.imagesAlert[i];
                this.img = this.imageCache[path];
                i++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 200);
    }

    startWalkingAnimation() {
        setInterval(() => {
            if (this.isWalking && !this.isDeadBoss && !this.isCharging) {
                this.playAnimation(this.imagesWalking);
            }
        }, 200);
    }

    startChargeTimer() {
        if (this.chargeInterval) clearInterval(this.chargeInterval);

        this.chargeInterval = setInterval(() => {
            if (this.isDeadBoss) {
                clearInterval(this.chargeInterval);
                return;
            }
            if (this.isAlerted && !this.isCharging) {
                this.performChargeAttack();
            }
        }, this.chargeCooldown);
    }

    performChargeAttack() {
        if (!this.world || !this.world.character) return;

        this.isCharging = true;
        const pepe = this.world.character;
        const toRight = (pepe.x > this.x);
        this.otherDirection = toRight;

        soundHub.playEffect(soundHub.soundBossCharge);

        const startX = this.x;
        const attackSpeed = this.chargeSpeed;
        const targetDistance = this.chargeDistance;
        let traveled = 0;

        // === ThunderRun-Animation starten ===
        this.playAnimation(this.imagesThunderRun);

        const moveInterval = setInterval(() => {
            if (this.isDeadBoss) {
                clearInterval(moveInterval);
                this.isCharging = false;
                return;
            }

            this.x += attackSpeed * (toRight ? 1 : -1);
            traveled += Math.abs(attackSpeed);

            // === Prüfung auf Treffer mit Pepe ===
            if (this.world.character.isColliding(this)) {
                this.world.character.energie -= 100;
                if (this.world.character.energie < 0) this.world.character.energie = 0;

                const percent = this.world.character.energie / this.world.character.holeEnergie * 100;
                this.world.statusBar.setPercentage(percent);
                soundHub.playEffect(soundHub.soundHit);

                // Rückstoß bei Treffer
                this.world.character.speedY = 25;
                clearInterval(moveInterval);
                this.isCharging = false;
                return;
            }

            // === Wenn Pepe erfolgreich ausgewichen ist ===
            if (traveled >= targetDistance) {
                clearInterval(moveInterval);
                this.isCharging = false;
                this.world.addScore(70);
                this.x = startX;
            }
        }, 40);
    }

    wasHit() {
        if (this.isDeadBoss) return;

        let now = Date.now();
        if (now - this.lastHitTime < this.hitCooldownMs) return;
        this.lastHitTime = now;

        this.energieBoss -= 60;

        if (this.world && this.world.bossBar) {
            let bossHealthPercentage = (this.energieBoss / 300) * 100;
            if (bossHealthPercentage < 0) bossHealthPercentage = 0;
            this.world.bossBar.setPercentage(bossHealthPercentage);
        }

        this.isHurtBoss = true;
        this.playAnimation(this.imagesHurt);
        setTimeout(() => this.isHurtBoss = false, 400);

        if (this.energieBoss <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isDeadBoss) return;
        this.stopAllBossSounds();
        this.isDeadBoss = true;
        this.isWalking = false;
        this.isAlerted = false;
        this.isCharging = false;

        if (this.chargeInterval) clearInterval(this.chargeInterval);

        let i = 0;
        const deathInterval = setInterval(() => {
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
                    setTimeout(() => {
                        this.world.addScore(150);
                        this.world.showVictoryScreen();
                    }, 1000);
                }
                if (this.world) {
                    setTimeout(() => this.world.gameOver = true, 1000);
                }
            }
        }, 250);
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
    * Stoppt alle Boss-bezogenen Sounds und Timer (Schrei-Loop, Thunder, Run-Animation).
    * Kann gefahrlos mehrfach aufgerufen werden.
    */
    stopBossAudioAndTimers() {
        // Intervalle / Timer sicher beenden ...
        try {
            if (this.screamInterval) {
                clearInterval(this.screamInterval);
                this.screamInterval = null;
            }
        } catch (e) { }
        try {
            if (this.thunderAttackTimer) {
                clearInterval(this.thunderAttackTimer);
                this.thunderAttackTimer = null;
            }
        } catch (e) { }
        try {
            if (this.thunderRunAnimInterval) {
                clearInterval(this.thunderRunAnimInterval);
                this.thunderRunAnimInterval = null;
            }
        } catch (e) { }
        try {
            if (this.walkAnimInterval) {
                clearInterval(this.walkAnimInterval);
                this.walkAnimInterval = null;
            }
        } catch (e) { }

        // Boss-bezogene Sounds stoppen ...
        if (typeof soundHub !== "undefined" && soundHub) {
            // Start-Schrei / Alarm
            if (soundHub.soundBossStart) {
                soundHub.stopEffect(soundHub.soundBossStart);
            }
            // Thunder-Angriff
            if (soundHub.soundThunderAttack) {
                soundHub.stopEffect(soundHub.soundThunderAttack);
            }
        }
    }

    stopAllBossSounds() {
        // Alle Boss-bezogenen Timer stoppen ...
        if (this.screamInterval) {
            clearInterval(this.screamInterval);
            this.screamInterval = null;
        }
        if (this.chargeInterval) {
            clearInterval(this.chargeInterval);
            this.chargeInterval = null;
        }
        // Laufende Sounds stoppen ...
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
 * Stoppt den eigenen Thunder-Attack-Sound (nicht Teil des SoundHubs)
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
    * Wird aufgerufen, wenn das Spiel durch Pepes Tod endet (Game-Over).
    * Stoppt alle Boss-Aktivitäten, Sounds und Timer vollständig.
    */
    onGameOverCleanup() {
        try {
            this.isAlerted = false;
            this.isWalking = false;
            this.isHurtBoss = false;
            this.isCharging = false;
            this.isDeadBoss = true;
            // Alle Timer abbrechen ...
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
            // Sicherheitsstopp aller aktiven Boss-Sounds
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
 * ===========================================================
 *  Zentrale Sicherheitsfunktion zum kompletten Stoppen aller
 *  Boss-Sounds und Intervalle (auch beim "Try Again").
 *  Kann jederzeit gefahrlos aufgerufen werden ...
 * ===========================================================
 */
    forceStopBossAudio() {
        try {
            // Alle internen Timer sicher abbrechen ...
            if (this.screamInterval) { clearInterval(this.screamInterval); this.screamInterval = null; }
            if (this.chargeInterval) { clearInterval(this.chargeInterval); this.chargeInterval = null; }
            if (this.animateInterval) { clearInterval(this.animateInterval); this.animateInterval = null; }

            // Flags neutralisieren ...
            this.isAlerted = false;
            this.isWalking = false;
            this.isCharging = false;
            this.isDeadBoss = true;

            // Lokale Sounds stoppen ...
            this.stopThunderAttackSound();

            // SoundHub-Effekte stoppen (Schrei & Sturmangriff) ...
            if (typeof soundHub !== "undefined" && typeof soundHub.stopBossCharge === "function") {
                soundHub.stopBossCharge();
            }

        } catch (e) {
            console.warn("Fehler beim kompletten Stoppen der Boss-Sounds:", e);
        }
    }
}
