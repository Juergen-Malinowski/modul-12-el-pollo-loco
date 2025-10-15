class Chicken extends MovableObject {

    heigth = 70;   // Höhe der Hühner
    width = 70;    // Breite der Hühner
    y = 380;       // Startposition der Hühner auf der Y-Achse

    imagesWalking = [
        '../assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png',
        '../assets/img/3_feinde_huehner/chicken_normal/1_walk/2_w.png',
        '../assets/img/3_feinde_huehner/chicken_normal/1_walk/3_w.png',
    ];



    constructor() {
        super().loadImage('../assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png');
        this.x = 300 + Math.random() * 200;  // Startposition des Huhns auf der X-Achse
        this.loadImages(this.imagesWalking);        
        this.anmimate();
    }

    anmimate() {
        setInterval(() => {                                // Intervall-Funktion, die die Animation steuert ...
            let i = this.correntImage % this.imagesWalking.length;

            let path = this.imagesWalking[i];  // Pfad des aktuellen Bildes der Animation
            this.img = this.imageCache[path];  // Pfad des Bildes der Animation laden
            this.correntImage++;               // Nr. des aktuellen Bildes der Animation erhöhen
        }, 120);                               // Intervall in ms (150 ms hier), in der die Animation neu gezeichnet wird
    };

}