class Endboss extends MovableObject {

    heigth = 300;             // Höhe Endboss
    width = 300;              // Breite Endboss
    y = 180;                  // Startposition Endboss auf der Y-Achse
    x = 1750;                 // Startposition Endboss auf der X-Achse
    energieBoss = 300;        // Lebens-ENERGIE Endboss
    moveSpeed = 3.0;          // Grundgeschwindigkeit Endboss
    minX = 400;               // linke Grenze (innerhalb des Levels)
    maxX = 2100;              // rechte Grenze (innerhalb des Levels)


    // kurzer Hit-Cooldown, damit Endboss pro Flasche nur einmal Schaden erhält ...
    lastHitTime = 0;          // Zeitstempel des letzten gültigen Treffers
    hitCooldownMs = 400;      // Dauer der Kurz-Unverwundbarkeit in Millisekunden


    offset = { top: 50, buttom: 10, left: 20, right: 20 };

    // Bild-Arrays ...
    imagesWalking = [
        '../assets/img/4_feinde_boss_huhn/1_walk/G1.png',
        '../assets/img/4_feinde_boss_huhn/1_walk/G2.png',
        '../assets/img/4_feinde_boss_huhn/1_walk/G3.png',
        '../assets/img/4_feinde_boss_huhn/1_walk/G4.png',
    ];

    imagesAlert = [
        '../assets/img/4_feinde_boss_huhn/2_alert/G5.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G6.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G7.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G8.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G9.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G10.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G11.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G12.png',
    ];

    imagesAttack = [
        '../assets/img/4_feinde_boss_huhn/3_attack/G13.png',
        '../assets/img/4_feinde_boss_huhn/3_attack/G14.png',
        '../assets/img/4_feinde_boss_huhn/3_attack/G15.png',
        '../assets/img/4_feinde_boss_huhn/3_attack/G16.png',
        '../assets/img/4_feinde_boss_huhn/3_attack/G17.png',
        '../assets/img/4_feinde_boss_huhn/3_attack/G18.png',
        '../assets/img/4_feinde_boss_huhn/3_attack/G19.png',
        '../assets/img/4_feinde_boss_huhn/3_attack/G20.png',
    ];

    imagesHurt = [
        '../assets/img/4_feinde_boss_huhn/4_hurt/G21.png',
        '../assets/img/4_feinde_boss_huhn/4_hurt/G22.png',
        '../assets/img/4_feinde_boss_huhn/4_hurt/G23.png',
    ];

    imagesDead = [
        '../assets/img/4_feinde_boss_huhn/5_dead/G24.png',
        '../assets/img/4_feinde_boss_huhn/5_dead/G25.png',
        '../assets/img/4_feinde_boss_huhn/5_dead/G26.png',
    ];

    // Zustands-Flags bei Spielstart ...
    isAlerted = false;
    isWalking = false;
    isDeadBoss = false;      // Endboss tot?
    isHurtBoss = false;      // gerade getroffen?
    alertPlayed = false;

    constructor() {
        super().loadImage('../assets/img/4_feinde_boss_huhn/2_alert/G5.png');
        this.loadImages(this.imagesWalking);
        this.loadImages(this.imagesAlert);
        this.loadImages(this.imagesAttack);
        this.loadImages(this.imagesHurt);
        this.loadImages(this.imagesDead);
        this.animate();
    }

    animate() {
        // Haupt-Intervall zur Statusprüfung ...
        setInterval(() => {
            // Wenn tot → keine weiteren Aktionen ...
            if (this.isDeadBoss) return;
            if (this.world && this.world.character) {
                // Wenn Charakter Positon X=1500 erreicht, dann startet Endboss ...
                if (!this.isAlerted && this.world.character.x >= 1400 ) {
                    this.triggerAlert();
                }
            }


            // Bewegungslogik Endboss ...
            if (this.isWalking && this.world && this.world.character) {
                const pepe = this.world.character;

                // sichere Levelgrenzen bestimmen ...
                const levelRight = (this.world.level && typeof this.world.level.levelEndX === "number")
                    ? (this.world.level.levelEndX - this.width)
                    : this.maxX;

                // effektive Grenzen ermitteln
                const leftBound = (typeof this.minX === "number") ? this.minX : 0;
                const rightBound = Math.max(leftBound, Math.min(this.maxX, levelRight));

                // Richtung bestimmen: steht Charakter links oder rechts vom Endboss?
                if (pepe.x < this.x) {
                    this.otherDirection = false;   // nach links schauen
                    this.x -= this.moveSpeed;
                } else {
                    this.otherDirection = true;    // nach rechts schauen
                    this.x += this.moveSpeed;
                }

                // --- Begrenzung links und rechts: Endboss darf nicht aus dem Bereich laufen ---
                if (this.x < leftBound) {
                    this.x = leftBound;
                    this.otherDirection = true;    // umdrehen nach rechts
                } else if (this.x > rightBound) {
                    this.x = rightBound;
                    this.otherDirection = false;   // umdrehen nach links
                }
            }
        }, 100);
    }

    triggerAlert() {
        // Endboss wurde alamiert und greift nun Charakter aktiv an ...
        this.isAlerted = true;
        this.playAlertAnimation(() => {
            // Nach Abschluss → in den Walk-Modus wechseln ...
            this.isWalking = true;
            this.startWalkingAnimation();
        });
    }

    playAlertAnimation(onComplete) {
        // ALARM animieren ...
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
        }, 200); // Geschwindigkeit der Alarmanimation
    }

    startWalkingAnimation() {
        // Endboss geht zeichnen ...
        setInterval(() => {
            if (this.isWalking && !this.isDeadBoss) {
                this.playAnimation(this.imagesWalking);
            }
        }, 200);
    }

    // Wird aufgerufen, wenn der Endboss getroffen wird ...
    wasHit() {
        if (this.isDeadBoss) {
            return;     // keine weiteren Treffer nach Tod
        }

        // kurzer Hit-Cooldown: Mehrfachauslösung innerhalb weniger Millisekunden verhindern ...
        let now = Date.now();
        if (now - this.lastHitTime < this.hitCooldownMs) {
            // innerhalb des Cooldowns → Treffer ignorieren
            return;
        }
        this.lastHitTime = now;

        // Schaden pro Treffer 
        this.energieBoss -= 60;    // Abzug Trefferpunkte für Wurftreffer beim Endboss 

        // Endboss-Statusbar aktualisieren ...
        if (this.world && this.world.bossBar) {
            let bossHealthPercentage = (this.energieBoss / 300) * 100;
            if (bossHealthPercentage < 0) {
                bossHealthPercentage = 0;
            }
            this.world.bossBar.setPercentage(bossHealthPercentage);
        }
        this.isHurtBoss = true;

        // kurze Hurt-Animation ...
        this.playAnimation(this.imagesHurt);
        setTimeout(() => {
            this.isHurtBoss = false;
        }, 400);


        // Wenn Energie leer → sterben ...
        if (this.energieBoss <= 0) {
            this.die();
        }
    }


    die() {
        if (this.isDeadBoss) return;

        this.isDeadBoss = true;
        this.isWalking = false;
        this.isAlerted = false;

        let i = 0;
        const deathInterval = setInterval(() => {
            if (i < this.imagesDead.length) {
                this.img = this.imageCache[this.imagesDead[i]];
                i++;
            } else {
                clearInterval(deathInterval);

                // Letztes Frame (G26) dauerhaft anzeigen
                const lastFrame = this.imageCache[this.imagesDead[this.imagesDead.length - 1]];
                if (lastFrame) {
                    this.img = lastFrame;
                }

                // Keine weitere Bewegung oder Animation
                this.stopAllAnimations();

                // SPIELENDE nach Tod des Endbosses ...
                if (this.world) {
                    setTimeout(() => {

                        // #########################################################
                        // HIER später SIEGES-Animation oder ähnliches einfügen !!!!
                        // #########################################################

                        this.world.showVictoryScreen();  // Gewinnbild anzeigen
                    }, 1000);                            // kleine Verzögerung für Wirkung
                }



                // SPIELSTOPP nach Tod des Endbosses ...
                if (this.world) {
                    setTimeout(() => {



                        this.world.gameOver = true;   // nur Spiellogik beenden, keine Sarganzeige
                    }, 1000);
                }

            }
        }, 250);
    }


    // Stoppt alle Bewegungs- oder Animations-Intervalle des Endboss.
    // (Verhindert, dass z. B. die Geh-Animation das Bild überschreibt)
    stopAllAnimations() {
        this.isWalking = false;
        this.isAlerted = false;
        this.isHurtBoss = false;
        this.speed = 0;
        this.acceleration = 0;
    }
}
