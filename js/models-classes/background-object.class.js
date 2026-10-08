class BackgroundObject extends MovableObject {

    width = 720;                       // Breite der Hintergrundobjekte
    heigth = 480;                      // Höhe der Hintergrundobjekte
    
    /**
     * Creates one background segment at the requested horizontal position.
     *
     * @param {string} imagePath - Path to the background image.
     * @param {number} x - Horizontal position inside the level.
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath);  // Pfad zu den Bildern der Hintergrundobjekte
        this.x = x;                    // x-Position des Hintergrundobjektes
        this.y = 480 - this.heigth;    // y-Position des Hintergrundobjektes (Canvas-Höhe - Höhe des Objektes = Startposition Bild)       
    }
}