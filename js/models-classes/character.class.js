
// mit "extends MovableObject" wird die Klasse "character" von der 
// Klasse "MovableObject" abgeleitet ...

class Character extends MovableObject {

    heigth = 330;   // Höhe des Charakters
    width = 150;    // Breite des Charakters
    y = 130;        // Startposition des Charakters auf der Y-Achse

    imagesWalking = [
        '../assets/img/2_charakter_pepe/2_walk/W-21.png',
        '../assets/img/2_charakter_pepe/2_walk/W-22.png',
        '../assets/img/2_charakter_pepe/2_walk/W-23.png',
        '../assets/img/2_charakter_pepe/2_walk/W-24.png',
        '../assets/img/2_charakter_pepe/2_walk/W-25.png',
        '../assets/img/2_charakter_pepe/2_walk/W-26.png',
    ];

    correntImage = 0;   // Nr. aktuelles Bildes der Animation

    constructor() {
        super().loadImage('../assets/img/2_charakter_pepe/2_walk/W-21.png');
        this.loadImages(this.imagesWalking);

        this.anmimate();
    }

    anmimate() {
        setInterval(() => {                                // Intervall-Funktion, die die Animation steuert ...
            // ALTERNATIVE mit "Modulo" ...
            // %-Zeichen ist der Modulo-Operator (Restwert einer Division) ...
            // correntImage beginnt bei 0 und imageWalking.length ist 6 (Anzahl der Bilder der Animation)
            // i wird dann 0,1,2,3,4,5 und beginnt dann wieder bei 0,1,2,3,4,5 usw.
            let i = this.correntImage % this.imagesWalking.length; 

            let path = this.imagesWalking[i];  // Pfad des aktuellen Bildes der Animation
            this.img = this.imageCache[path];  // Pfad des Bildes der Animation laden
            this.correntImage++;               // Nr. des aktuellen Bildes der Animation erhöhen
        }, 150);                               // Intervall in ms (1000 ms hier), in der die Animation neu gezeichnet wird
    };

    jump() {

    }
}