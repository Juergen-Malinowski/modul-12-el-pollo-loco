class ThrowableObjects extends MovableObject {

    width = 60;       // Breite der Flaschen
    heigth = 80;      // Höhe der Flaschen
    y = 380;          // Y-Position der Flaschen

    constructor(x = 0, y = 0, isGroundBottle = false) {
        super();  // Super-Konstruktor genau EINMAL aufrufen

        if (isGroundBottle) {
            // === Boden-Flasche beim Spielstart ===
            this.loadImage('../assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png');
            this.x = 200 + Math.random() * 1200;   // zufällige Position am Boden
            this.y = 380;
        } else {
            // === geworfene Flasche ===
            this.loadImage('../assets/img/6_salsa_flasche/salsa_bottle.png');
            this.x = x;
            this.y = y;
            this.throwBottle();
        }
    }

    throwBottle() {
        // Wurfbewegung in Parabelbahn erzeugen
        this.speedY = 30;     // Wurfhöhe 
        this.applyGravity();  // Wurfbogen generieren
        setInterval(() => {
            this.x += 10;     // Wurfgeschwindigkeit
        }, 20);               // Bildwiederholung beeinflusst Flugbahn
    }
}
