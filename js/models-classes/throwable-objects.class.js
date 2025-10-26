class ThrowableObjects extends MovableObject {

    width = 60;       // Breite der Flaschen
    heigth = 80;      // Höhe der Flaschen
    y = 380;          // Y-Position der Flaschen

    constructor(x = 0, y = 0, isGroundBottle = false, direction = 1) {
        super();

        if (isGroundBottle) {
            this.loadImage('../assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png');
            this.x = 200 + Math.random() * 1200;
            this.y = 380;
        } else {
            this.loadImage('../assets/img/6_salsa_flasche/salsa_bottle.png');
            this.x = x;
            this.y = y;
            this.direction = direction;     //  Richtung übernehmen für Wurf
            this.throwBottle();
        }
    }

    throwBottle() {
        this.speedY = 30;
        this.applyGravity();

        setInterval(() => {
            this.x += 10 * this.direction; // nach links oder rechts werfen
        }, 20);
    }
}
