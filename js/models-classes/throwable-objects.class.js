class ThrowableObjects extends MovableObject {

    width = 60;       // Breite der Flaschen
    heigth = 80;      // Höhe der Flaschen
    y = 380;          // Y-Position der Flaschen
    static gameStart = true;   // Wurde Spiel gerade gestartet ?  (klassenweit)

    constructor(x, y) {
        super();  // Super-Konstruktor genau EINMAL aufrufen

        // Übergabe-Parameter abhängig von Position des Charakters ...
        if (ThrowableObjects.gameStart) {
            // Boden-Flaschen beim Spielstart verteilen
            this.loadImage('../assets/img/6_salsa_flasche/1_salsa_bottle_on_ground.png');
            this.x = 200 + Math.random() * 1200;       // Startposition der Flasche auf der X-Achse
            this.y = 380;
            ThrowableObjects.gameStart = false;        // ab jetzt gilt: Spiel läuft
        } else {
            // geworfene Flasche
            this.loadImage('../assets/img/6_salsa_flasche/salsa_bottle.png');
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
