
// mit "extends MovableObject" wird die Klasse "character" von der 
// Klasse "MovableObject" abgeleitet ...

class Character extends MovableObject {

    heigth = 330;         // Höhe des Charakters
    width = 150;          // Breite des Charakters
    y = 0;                // Startposition des Charakters auf der Y-Achse (Höhenposition) = 130
    x = 200;              // Startposition des Charakters auf der X-Achse (links/rechts)
    speed = 100;          // Bewegungsweite 20px pro Zeitinvervall des Charakters
    world;                // Übergabe der Bewegungsparameter aus der "world.class.js", welche sie von "game.js" erhalten hat
    energie = 300;        // Lebens-ENERGIE (Gesundheit, Trefferpunkte)
    holeEnergie = 300;    // Volle Trefferpunkte

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
        // '../assets/img/2_charakter_pepe/3_jump/J-31.png',
        // '../assets/img/2_charakter_pepe/3_jump/J-32.png',
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

    lastActionTime = Date.now();  // Zeitstempel der letzten Spieleraktion

    constructor() {
        super().loadImage('../assets/img/2_charakter_pepe/2_walk/W-21.png');
        this.loadImages(this.imagesWalking);
        this.loadImages(this.imagesJumping);
        this.loadImages(this.imagesDead);
        this.loadImages(this.imagesHurt);
        this.loadImages(this.imagesWating);        // NEU: Idle-Animation laden
        this.loadImages(this.imagesLongWaiting);    // NEU: Long Idle-Animation laden
        this.applyGravity();
        this.animate();
    }

    animate() {

        setInterval(() => {        // Intervall-Funktion, die die Bewegung steuert ...
            // WALKING-SPEED Charakter festlegen bzw. initialisieren ...
            if (this.world.keyboard.RIGHT && this.x < this.world.level.levelEndX) {
                this.moveRight();
                this.otherDirection = false;
                this.lastActionTime = Date.now(); // NEU: Zeitstempel aktualisieren (Spieler aktiv)
            }

            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft();
                this.otherDirection = true;
                this.lastActionTime = Date.now(); // NEU: Zeitstempel aktualisieren (Spieler aktiv)
            }

            if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                this.speedY = 45;
                this.lastActionTime = Date.now(); // NEU: Zeitstempel aktualisieren (Spieler aktiv)
            }

            // Hintergrund-Verschiebung (Variable "cameraX") auf Bewegung des Charakters anpassen !
            this.world.cameraX = -this.x + 200;
        }, 100);

        setInterval(() => {        // Intervall-Funktion, die die Animationen steuert ...

            if (this.isDead()) {
                this.playAnimation(this.imagesDead);
            } else if (this.isHurt()) {
                this.playAnimation(this.imagesHurt);
            } else if (this.isAboveGround()) {
                this.playAnimation(this.imagesJumping);
            } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                this.playAnimation(this.imagesWalking);
            } else {
                // === NEU: IDLE-STEUERUNG ===
                let idleTime = (Date.now() - this.lastActionTime) / 1000;  // Sekunden seit letzter Aktion

                if (idleTime < 3) {
                    // Spieler steht erst kurz still → Idle
                    this.playAnimation(this.imagesWating);
                } else if (idleTime >= 4) {
                    // Spieler steht sehr lange still → Long Idle
                    this.playAnimation(this.imagesLongWaiting );
                }
            }

        }, 150);
    };
}