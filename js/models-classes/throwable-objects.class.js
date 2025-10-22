class ThrowableObjects extends MovableObject {

    width = 60;       // Breite der Flaschen
    heigth = 80;      // Höhe der Flaschen
    y = 360;          // Y-Position der Flaschen
    gameStart = true;              // Wurde Spiel gerade gestartet ?

    constructor(x, y) {
        // Übergabe-Parameter abhängig von Position des Charakters ...
        super().loadImage('../assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png');
        if (this.gameStart) {
            this.x = 200 + Math.random() * 1200;       // Startposition des Huhns auf der X-Achse
            this.gameStart = false;
        } else {
            super().loadImage('../assets/img/6_salsa_flasche/salsa_bottle.png');
            this.x = x;
            this.y = y;
            this.width = 60;
            this.heigth = 80;
            this.throwBottle();
        }

    }

    throwBottle() {
        this.speedY = 30;     // Wurfhöhe 
        this.applyGravity();  // Wurfbogen generieren
        setInterval(() => {
            this.x += 10;     // Wurfgeschwindigkeit
        }, 20);               // Bildwiederholung beeinflusst Flugbahn
    }

}