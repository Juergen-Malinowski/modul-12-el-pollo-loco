
// mit "extends MovableObject" wird die Klasse "character" von der 
// Klasse "MovableObject" abgeleitet ...

class Character extends MovableObject {

    heigth = 330;   // Höhe des Charakters
    width = 150;    // Breite des Charakters
    y = 0;          // Startposition des Charakters auf der Y-Achse (Höhenposition) = 130
    x = 200;        // Startposition des Charakters auf der X-Achse (links/rechts)
    speed = 100;    // Bewegungsweite 20px pro Zeitinvervall des Charakters
    world;          // Übergabe der Bewegungsparameter aus der "world.class.js", welche sie von "game.js" erhalten hat
    energie = 300;  // Lebens-ENERGIE (Gesundheit, Trefferpunkte)
    holeEnergie = 300;   // Volle Trefferpunkte

    offset = {      // Korrektur der Kollision auf den tatsächlichen Körper !
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


    constructor() {
        super().loadImage('../assets/img/2_charakter_pepe/2_walk/W-21.png');
        this.loadImages(this.imagesWalking);
        this.loadImages(this.imagesJumping);
        this.loadImages(this.imagesDead);
        this.loadImages(this.imagesHurt);
        this.applyGravity();
        this.animate();
    }

    animate() {

        setInterval(() => {        // Intervall-Funktion, die die Animation steuert ...
            // WALKING-SPEED Charakter festlegen bzw. initialisieren ...
            if (this.world.keyboard.RIGHT && this.x < this.world.level.levelEndX) {
                //"this.x < this.world.level.levelEndX" (Wert=2000) verhindert, 
                // dass Charakter rechts aus dem Bild läuft.
                //2000 = die letzte Startposition für Hintergrund (1440px) 
                // + Breite Bild (720px) - Breite Charakter-Bild (150px) 
                // - 410px (Damit am ENDE ein voller Background noch zu sehen ist !!!)
                this.moveRight();
                this.otherDirection = false;
            }

            if (this.world.keyboard.LEFT && this.x > 0) {
                //Bewegung nach LINKS des Charakters ...
                //this.x > 0 verhindert, dass Charakter links aus dem Bild läuft
                this.moveLeft();
                this.otherDirection = true;
            }

            if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                // SPRUNG Charakter nach oben
                this.speedY = 45;
            }

            // Hintergrund-Verschiebung (Variable "cameraX") auf Bewegung des Charakters anpassen !
            this.world.cameraX = -this.x + 200;  // +200 für korrekte Position im Bildschirm gemäß STARTPOSITION oben !
        }, 100);

        setInterval(() => {          // Intervall-Funktion, die die Animationen steuert ...

            if (this.isDead()) {
                // Funktion "isDead" ist TRUE, wenn "this.energie == 0" ist, SONST FALSE ...
                this.playAnimation(this.imagesDead);       // Funktion generiert nun die Bilder
            } else {
                if (this.isHurt()) {
                    this.playAnimation(this.imagesHurt);   // Funktion generiert nun die Bilder
                }
                else {
                    if (this.isAboveGround()) {
                        // CHARAKTER fällt aus der Luft zu Boden ...
                        this.playAnimation(this.imagesJumping);    // Funktion generiert nun die Bilder                
                    } else {
                        if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                            // CHARAKTER geht links / rechts ...
                            this.playAnimation(this.imagesWalking);    // Funktion generiert nun die Bilder
                        }
                    };
                }
            }
        }, 150);    // Intervall in ms (150 ms hier), in der die Animation neu gezeichnet wird

    };
}