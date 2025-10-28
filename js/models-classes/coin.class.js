class Coin extends MovableObject {

    width = 80;           // Breite der Münze
    heigth = 80;          // Höhe der Münze
    collected = false;    // Zustand: wurde Münze bereits eingesammelt?

    constructor() {
        super().loadImage('assets/img/8_muenzen/coin_2.png');    // Bild Münze
        
        // Wenn keine Koordinaten übergeben wurden → zufällige Position erzeugen
        this.x = 300 + Math.random() * 1800;
        this.y = 100 + Math.random() * 200; 
    }

    animate() {
        //"Leucht"-Simulation ...
        setInterval(() => {
            // kleiner Effekt: leichtes Auf- und Abwippen
            this.y += Math.sin(Date.now() / 200) * 0.5;
        }, 50);
    } 
}
 