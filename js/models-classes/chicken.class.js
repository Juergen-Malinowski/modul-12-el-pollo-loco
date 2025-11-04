class Chicken extends MovableObject {

    heigth = 70;   // Höhe der Hühner
    width = 70;    // Breite der Hühner
    y = 380;       // Startposition der Hühner auf der Y-Achse
    speed = 0.3;   // Geschwindigkeit der Hüher Bewegung nach links

    offset = {     // Korrektur der Kollision auf den tatsächlichen Körper !
        top: 5,
        buttom: 5,
        left: 5,
        right: 5,
    }

    imagesWalking = [
        './assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png',
        './assets/img/3_feinde_huehner/chicken_normal/1_walk/2_w.png',
        './assets/img/3_feinde_huehner/chicken_normal/1_walk/3_w.png',
    ];

    imageDead = './assets/img/3_feinde_huehner/chicken_normal/2_dead/dead.png'; // Bild für „totes Huhn“ (liegt am Boden)

    isDeadChicken = false; // Status: lebt oder ist bereits tot


    constructor() {
        super().loadImage('./assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png');
        this.x = 350 + Math.random() * 1500;       // Startposition des Huhns auf der X-Achse
        this.speed = 0.2 + Math.random() * 0.3;    // Jedes Huhn bekommt eine individuelle Geschwindigkeit
        this.loadImages(this.imagesWalking);       // Bewegungsbild laden   
        this.animate();                            // Huhn bewegen
    }

    animate() {
        soundHub.registerInterval(setInterval(() => {
            // Hühner nach links bewegen / "speed" steuert Geschwindigkeit
            // (17ms = 0,017s bzw. 60 Frames pro Sek. bzw. 1000/60 = 17 ms / 60 Frames pro Sek. ist so das Maximum in Spielen)
            if (!this.isDeadChicken) {              // Nur bewegen, wenn Huhn lebt
                this.moveLeft();
            }
        }, 1000 / 60));

        soundHub.registerInterval(setInterval(() => {                         // Intervall-Funktion, die die Animation steuert ...
            if (!this.isDeadChicken) {               // Nur animieren, wenn Huhn lebt
                this.playAnimation(this.imagesWalking);  // Funktion generiert nun die Bilder
            }
        }, 120));                                     // Intervall in ms (120 ms hier), in der die Animation neu gezeichnet wird
    };

    die() {
        // Setzt Huhn auf „tot“ und zeigt das tote Bild an, keine Bewegung mehr
        this.isDeadChicken = true;       // Kennzeichen: Huhn lebt nicht mehr
        this.loadImage(this.imageDead);  // Bild wechseln auf totes Huhn
        this.speed = 0;                  // Bewegung sofort stoppen
    }
}
