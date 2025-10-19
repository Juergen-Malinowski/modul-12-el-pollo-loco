class Chicken extends MovableObject {

    heigth = 70;   // Höhe der Hühner
    width = 70;    // Breite der Hühner
    y = 380;       // Startposition der Hühner auf der Y-Achse
    speed = 0.3;   // Geschwindigkeit der Hüher Bewegung nach links

    imagesWalking = [
        '../assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png',
        '../assets/img/3_feinde_huehner/chicken_normal/1_walk/2_w.png',
        '../assets/img/3_feinde_huehner/chicken_normal/1_walk/3_w.png',
    ];



    constructor() {
        super().loadImage('../assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png');
        this.x = 350 + Math.random() * 200;       // Startposition des Huhns auf der X-Achse
        this.speed = 0.2 + Math.random() * 0.3;   // Jedes Huhn bekommt eine individuelle Geschwindigkeit
        this.loadImages(this.imagesWalking);      // Bewegungsbild laden   
        this.animate();                          // Huhn bewegen
    }

    animate() {
        this.moveLeft();                         // Hühner nach links bewegen / "speed" steuert Geschwindigkeit
        setInterval(() => {                      // Intervall-Funktion, die die Animation steuert ...
        this.playAnimation(this.imagesWalking);  // Funktion generiert nun die Bilder
        }, 120);                                 // Intervall in ms (120 ms hier), in der die Animation neu gezeichnet wird
    };

}