    class Chicken extends MovableObject {
        
    heigth = 70;   // Höhe der Hühner
    width = 70;    // Breite der Hühner
    y = 380;       // Startposition der Hühner auf der Y-Achse

    constructor () {
        super().loadImage('../assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png');
        this.x = 300 + Math.random() * 200;  // Startposition des Huhns auf der X-Achse
    }

}