    class Chicken extends MovableObject {
        y = 313;         // Anpassung der Y-Achse für das Huhn
        
    constructor () {
        super().loadImage('../assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png');
        this.x = 300 + Math.random() * 200;  // Startposition des Huhns auf der X-Achse
    }

}