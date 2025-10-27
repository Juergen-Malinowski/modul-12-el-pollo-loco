class Endboss extends MovableObject {

    heigth = 300;       // Höhe Endboss
    width = 300;        // Breite Endboss
    y = 180;            // Startposition Endboss auf der Y-Achse
    x = 1750;           // Startposition Endboss auf der X-Achse
    energieBoss = 300;  // Lebens-ENERGIE Endboss

    offset = { top: 50, buttom: 10, left: 20, right: 20 };

    // === Bild-Arrays ===
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

    // === Zustands-Flags ===
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
        // === Haupt-Intervall zur Statusprüfung ===
        setInterval(() => {
            // Wenn tot → keine weiteren Aktionen
            if (this.isDeadBoss) return;

            if (this.world && this.world.character) {
                // Abstand zwischen Charakter und Endboss
                let distance = this.x - this.world.character.x;

                // Wenn der Spieler in Reichweite kommt (z. B. unter 1850 px)
                if (distance < 1850 && !this.isAlerted) {
                    this.triggerAlert();
                }
            }

            // Wenn Endboss aktiv läuft → Bewegung nach links
            if (this.isWalking) {
                this.x -= 1.2; // Gehgeschwindigkeit
            }

        }, 100);
    }

    triggerAlert() {
        this.isAlerted = true;
        this.playAlertAnimation(() => {
            // Nach Abschluss → in den Walk-Modus wechseln
            this.isWalking = true;
            this.startWalkingAnimation();
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
        }, 200); // Geschwindigkeit der Alarmanimation
    }

    startWalkingAnimation() {
        setInterval(() => {
            if (this.isWalking && !this.isDeadBoss) {
                this.playAnimation(this.imagesWalking);
            }
        }, 200);
    }

    // === NEU: Wird aufgerufen, wenn der Endboss getroffen wird ===
    wasHit() {
        if (this.isDeadBoss) return; // keine weiteren Treffer nach Tod

        this.energieBoss -= 50; // Schaden pro Treffer
        this.isHurtBoss = true;

        console.log("Endboss getroffen! Restenergie:", this.energieBoss);

        // kurze Hurt-Animation
        this.playAnimation(this.imagesHurt);
        setTimeout(() => this.isHurtBoss = false, 400);

        // Wenn Energie leer → sterben
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



                //SPIELSTOPP nach Tod des Endbosses ...
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
