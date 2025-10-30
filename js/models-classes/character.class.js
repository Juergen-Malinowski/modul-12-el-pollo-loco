
class Character extends MovableObject {

    heigth = 330;         // Höhe des Charakters
    width = 150;          // Breite des Charakters
    y = 0;                // Startposition des Charakters auf der Y-Achse (Höhenposition) = 130
    x = 200;              // Startposition des Charakters auf der X-Achse (links/rechts)
    speed = 20;           // Bewegungsweite 20px pro Zeitinvervall des Charakters
    world;                // Übergabe der Bewegungsparameter aus der "world.class.js", welche sie von "game.js" erhalten hat
    energie = 300;        // Lebens-ENERGIE (Gesundheit, Trefferpunkte)
    holeEnergie = 300;    // Volle Trefferpunkte
    isDeadAnimationPlaying = false;  // steuert die Länge der Dead-Animation


    offset = {            // Korrektur der Kollision auf den tatsächlichen Körper !
        top: 130,
        buttom: 10,
        left: 40,
        right: 40,
    }

    imagesWalking = [
        '../assets/img/2_charakter_pepe/2_walk/W-21.png',
        '../assets/img/2_charakter_pepe/2_walk/W-22.png',
        '../assets/img/2_charakter_pepe/2_walk/W-23.png',
        '../assets/img/2_charakter_pepe/2_walk/W-24.png',
        '../assets/img/2_charakter_pepe/2_walk/W-25.png',
        '../assets/img/2_charakter_pepe/2_walk/W-26.png',
    ];

    imagesJumping = [
        '../assets/img/2_charakter_pepe/3_jump/J-33.png',
        '../assets/img/2_charakter_pepe/3_jump/J-34.png',
        '../assets/img/2_charakter_pepe/3_jump/J-35.png',
        '../assets/img/2_charakter_pepe/3_jump/J-36.png',
        '../assets/img/2_charakter_pepe/3_jump/J-37.png',
        '../assets/img/2_charakter_pepe/3_jump/J-38.png',
        '../assets/img/2_charakter_pepe/3_jump/J-39.png',
        '../assets/img/2_charakter_pepe/3_jump/J-31.png',
    ];

    imagesDead = [
        '../assets/img/2_charakter_pepe/5_dead/D-51.png',
        '../assets/img/2_charakter_pepe/5_dead/D-52.png',
        '../assets/img/2_charakter_pepe/5_dead/D-53.png',
        '../assets/img/2_charakter_pepe/5_dead/D-54.png',
        '../assets/img/2_charakter_pepe/5_dead/D-55.png',
        '../assets/img/2_charakter_pepe/5_dead/D-56.png',
    ];

    imagesHurt = [
        '../assets/img/2_charakter_pepe/4_hurt/H-41.png',
        '../assets/img/2_charakter_pepe/4_hurt/H-42.png',
        '../assets/img/2_charakter_pepe/4_hurt/H-43.png',
    ];

    imagesWating = [
        '../assets/img/2_charakter_pepe/1_idle/idle/I-1.png',
        '../assets/img/2_charakter_pepe/1_idle/idle/I-4.png',
        '../assets/img/2_charakter_pepe/1_idle/idle/I-7.png',
        '../assets/img/2_charakter_pepe/1_idle/idle/I-8.png',
        '../assets/img/2_charakter_pepe/1_idle/idle/I-9.png',
        '../assets/img/2_charakter_pepe/1_idle/idle/I-10.png',
    ];

    imagesLongWaiting = [
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-11.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-12.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-13.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-14.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-15.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-16.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-17.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-18.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-19.png',
        '../assets/img/2_charakter_pepe/1_idle/long_idle/I-20.png',
    ];

    imagesThrowing = [
        '../assets/img/2_charakter_pepe/2_walk/W-24.png',
        '../assets/img/2_charakter_pepe/2_walk/W-25.png',
        '../assets/img/2_charakter_pepe/2_walk/W-26.png',

    ];

    lastActionTime = Date.now();  // Zeitstempel der letzten Spieleraktion

    constructor() {
        super().loadImage('../assets/img/2_charakter_pepe/2_walk/W-21.png');
        this.loadImages(this.imagesWalking);       // Gehen-Animation laden
        this.loadImages(this.imagesJumping);       // Springen-Animation laden
        this.loadImages(this.imagesDead);          // Sterbe-Animation laden
        this.loadImages(this.imagesHurt);          // Verletzungs-Animation laden
        this.loadImages(this.imagesWating);        // Idle-Animation laden
        this.loadImages(this.imagesLongWaiting);   // Long Idle-Animation laden
        this.loadImages(this.imagesThrowing);      // Wurf-Animation laden

        this.applyGravity();
        this.animate();
    }

    animate() {
        if (this.isThrowing) return;   // Keine Bewegung während Wurf-Animation !! (derzeit 0,4 Sek.)

        // BEWEGUNGS-STEUERUNG ...
        setInterval(() => {
            // Wenn Sterbeanimation läuft → keine Bewegung mehr zulassen ...
            if (this.isDeadAnimationPlaying) {
                return;
            }

            // WALKING-SPEED Charakter festlegen bzw. initialisieren ...
            if (this.world.keyboard.RIGHT && this.x < this.world.level.levelEndX) {
                this.moveRight();
                this.otherDirection = false;
                this.lastActionTime = Date.now(); // Zeitstempel aktualisieren (Spieler aktiv)
            }

            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();
                this.otherDirection = true;
                this.lastActionTime = Date.now(); // Zeitstempel aktualisieren (Spieler aktiv)
            }

            if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                soundHub.playEffect(soundHub.soundJumping);     // Sprung-Sound abspielen
                this.speedY = 45;
                this.lastActionTime = Date.now(); // Zeitstempel aktualisieren (Spieler aktiv)
            }
            // Falls am oder unter dem Boden und nicht mehr aufwärts ... exakt einschnappen ...
            if (!this.isAboveGround() && this.speedY <= 0) {
                this.snapToGround();
            }
            // Hintergrund-Verschiebung (Variable "cameraX") auf Bewegung des Charakters anpassen !
            this.world.cameraX = -this.x + 200;
        }, 100);


        // ANIMATIONS-STEUERUNG ...
        setInterval(() => {

            // 1) Sterben erkannt, aber Animation noch nicht gestartet → starten und SOFORT abbrechen ...
            if (this.isDead() && !this.isDeadAnimationPlaying) {
                this.isDeadAnimationPlaying = true;   // KEIN wiederholtes Abspielen !!!
                this.playDeadAnimation();
                return;                               // keine andere Animation in diesem Tick mehr ausführen
            }

            // 2) Sterbeanimation läuft bereits → nichts anderes abspielen ...
            if (this.isDeadAnimationPlaying) {
                return;
            }

            // 3) Normales Animationsrouting (nur wenn NICHT tot) ...
            if (this.isHurt()) {
                this.playAnimation(this.imagesHurt);
            } else if (this.isAboveGround()) {
                this.playAnimation(this.imagesJumping);
            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.imagesWalking);
            } else {
                // IDLE-STEUERUNG ...
                let idleTime = (Date.now() - this.lastActionTime) / 1000;  // Sekunden seit letzter Aktion

                if (idleTime < 3) {
                    // Spieler steht erst kurz still → Idle
                    this.playAnimation(this.imagesWating);
                } else if (idleTime >= 4) {
                    // Spieler steht sehr lange still → Long Idle
                    this.playAnimation(this.imagesLongWaiting);
                }
            }

        }, 150);
    };

    playDeadAnimation() {
        // Animation für das Sterben des Charakters einmalig abspielen ...
        this.speedY = 0;          // Bewegung nach oben/unten stoppen
        this.acceleration = 0;    // Keine Gravitation mehr

        let i = 0;                // Zähler für die Bilder der Sterbeanimation

        const deathInterval = setInterval(() => {
            // Prüfen, ob alle Bilder durchlaufen wurden ...
            if (i < this.imagesDead.length) {
                let path = this.imagesDead[i];             // Pfad zum aktuellen Bild der Sterbeanimation
                this.img = this.imageCache[path];          // Bild aus Cache übernehmen
                i++;
            } else {
                setTimeout(() => {
                    clearInterval(deathInterval);          // Intervall stoppen, sobald letztes Bild erreicht
                    this.img = this.imageCache[this.imagesDead[this.imagesDead.length - 1]];
                }, 200);                                   // etwas weicheres Ende
            }
        }, 200);                                           // 200 ms = Geschwindigkeit des Sterbens (kann angepasst werden)

        setTimeout(() => {

            // ###############################################################
            // "Hier" SPÄTER RESTART GAME den Button oder Ähnliches intergrieren
            // ############################################################### 

        }, 2000);

        // Zeige Sarg-Animation bei Tod des Charakters ...
        if (this.world) {
            setTimeout(() => {
                this.world.startCoffinAnimation();
            }, 1000); // 1 Sekunde nach dem Tod erscheinen
        }

    }

    playThrowAnimation() {
        // Falls gerade eine Idle-Animation aktiv ist → sofort beenden ...
        this.lastActionTime = Date.now();                // Idle-Timer zurücksetzen

        // kurze Bewegungssperre während Wurf-Animation ...
        this.isThrowing = true;
        setTimeout(() => this.isThrowing = false, 400);  // nach 0.4 Sekunden wieder aktiv

        // Verhindert, dass gleichzeitig andere Animationen laufen ...
        if (this.isDeadAnimationPlaying) return;

        let i = 0;
        const throwInterval = setInterval(() => {
            if (i < this.imagesThrowing.length) {
                const path = this.imagesThrowing[i];
                this.img = this.imageCache[path];
                i++;
            } else {
                clearInterval(throwInterval);
            }
        }, 20);  // Geschwindigkeit der Wurfanimation (80 ms pro Frame)
    }

    // Exakt auf die Bodenhöhe einschnappen (nur wenn Bewegung beendet ist) ...
    snapToGround() {
        // Nur korrigieren, wenn keine Aufwärts- oder Abwärtsbewegung mehr da ist ...
        if (this.speedY <= 0 && this.y > 130 && !this.isAboveGround()) {
            this.y = 130;      // exakt auf Bodenhöhe bringen
            this.speedY = 0;   // vertikale Bewegung stoppen
        }
    }
}
