
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