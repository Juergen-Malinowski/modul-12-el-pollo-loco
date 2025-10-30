class Cloud extends MovableObject {

    speed = 0.2;

    constructor(x, y) {
        super().loadImage('./assets/img/5_hintergrund/layers/4_clouds/1.png');
        this.x = x;           // exakte horizontale Position
        this.y = y;           // exakte vertikale Position
        this.width = 400;     // feste Wolkengröße (kannst du bei Bedarf anpassen)
        this.height = 250;
        this.animate();
    }

    // Wolken bewegen sich langsam nach links (Parallax-Effekt)
    animate() {
        setInterval(() => {
            this.moveLeft();
        }, 100); // alle 50ms ein kleiner Schritt → ergibt ruhige Bewegung
    }

}
