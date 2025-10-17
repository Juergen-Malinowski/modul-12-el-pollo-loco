
// mit "extends MovableObject" wird die Klasse "character" von der 
// Klasse "MovableObject" abgeleitet ...

class Character extends MovableObject {

    heigth = 330;   // Höhe des Charakters
    width = 150;    // Breite des Charakters
    y = 130;        // Startposition des Charakters auf der Y-Achse (Höhenposition)
    x = 200;        // Startposition des Charakters auf der X-Achse (links/rechts)
    speed = 20;     // Bewegungsweite 20px pro Zeitinvervall des Charakters
    world;          // Übergabe der Bewegungsparameter aus der "world.class.js", welche sie von "game.js" erhalten hat

    imagesWalking = [
        '../assets/img/2_charakter_pepe/2_walk/W-21.png',
        '../assets/img/2_charakter_pepe/2_walk/W-22.png',
        '../assets/img/2_charakter_pepe/2_walk/W-23.png',
        '../assets/img/2_charakter_pepe/2_walk/W-24.png',
        '../assets/img/2_charakter_pepe/2_walk/W-25.png',
        '../assets/img/2_charakter_pepe/2_walk/W-26.png',
    ];



    constructor() {
        super().loadImage('../assets/img/2_charakter_pepe/2_walk/W-21.png');
        this.loadImages(this.imagesWalking);
        this.anmimate();
    }

    anmimate() {

        setInterval(() => {        // Intervall-Funktion, die die Animation steuert ...
            // WALKING-SPEED Charakter festlegen bzw. initialisieren ...
            if (this.world.keyboard.RIGHT && this.x < 2010) {
                //"this.x < 2010" verhindert, dass Charakter rechts aus dem Bild läuft.
                //2010 = die letzte Startposition für Hintergrund (1440px) + Breite Bild (720px) - Breite Charakter-Bild (150px)
                this.x += this.speed;
                this.otherDirection = false;
            }

            if (this.world.keyboard.LEFT && this.x > 0) {
                //this.x > 0 verhindert, dass Charakter links aus dem Bild läuft
                this.x -= this.speed;
                this.otherDirection = true;
            }
            // Hintergrund-Verschiebung (Variable "cameraX") auf Bewegung des Charakters anpassen !
            this.world.cameraX = -this.x +200;  // +200 für korrekte Position im Bildschirm gemäß STARTPOSITION oben !
        }, 100);

        setInterval(() => {          // Intervall-Funktion, die die Animation steuert ...

            if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {

                // this.x += this.speed;

                // WALK-ANIMATION ...
                // %-Zeichen ist der "Modulo"-Operator (Restwert einer Division) ...
                // correntImage beginnt bei 0 und imageWalking.length ist 6 (Anzahl der Bilder der Animation)
                // i wird dann 0,1,2,3,4,5 und beginnt dann wieder bei 0,1,2,3,4,5 usw.
                let i = this.correntImage % this.imagesWalking.length;
                let path = this.imagesWalking[i];  // Pfad des aktuellen Bildes der Animation
                this.img = this.imageCache[path];  // Pfad des Bildes der Animation laden
                this.correntImage++;               // Nr. des aktuellen Bildes der Animation erhöhen
            }
        }, 150);                                   // Intervall in ms (150 ms hier), in der die Animation neu gezeichnet wird

    };

    jump() {

    }
}