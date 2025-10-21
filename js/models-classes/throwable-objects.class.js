class ThrowableObjects extends MovableObject {



    constructor(x, y) {
        super().loadImage('../assets/img/6_salsa_flasche/salsa_bottle.png');
        this.x = x;
        this.y = y;
        this.width = 60;
        this.heigth = 80;
        this.throwBottle();
    }

    throwBottle() {
        // Übergabe-Parameter abhängig von Position des Charakters ...
        this.speedY = 30;     // Wurfhöhe 
        this.applyGravity();  // Wurfbogen generieren

        setInterval( () => {
            this.x += 10;     // Wurfgeschwindigkeit
        }, 20);               // Bildwiederholung beeinflusst Flugbahn
    }

}