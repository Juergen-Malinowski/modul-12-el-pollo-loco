
class Endboss extends MovableObject {

    heigth = 300;   // Höhe Endboss
    width = 300;    // Breite Endboss
    y = 180;        // Startposition Endboss auf der Y-Achse

    offset = {      // Korrektur der Kollision auf den tatsächlichen Körper !
        top: 50,
        buttom: 10,
        left: 20,
        right: 20,
    }

    imagesWalking = [
        '../assets/img/4_feinde_boss_huhn/2_alert/G5.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G6.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G7.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G8.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G9.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G10.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G11.png',
        '../assets/img/4_feinde_boss_huhn/2_alert/G12.png',
    ];

    constructor() {
        super().loadImage(this.imagesWalking[0]);
        this.loadImages(this.imagesWalking);      // Bewegungsbild laden
        this.x = 1750;                             // Startposition Endboss auf der X-Achse
        this.animate()                            // Endboss bewegen
    }


    animate() {
        setInterval(() => {                      // Intervall-Funktion, die die Animation steuert ...
            this.playAnimation(this.imagesWalking);  // Funktion generiert nun die Bilder
        }, 200);                                 // Intervall in ms (200 ms hier), in der die Animation neu gezeichnet wird
    };

}