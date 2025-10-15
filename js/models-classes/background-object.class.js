
class BackgroundObject extends MovableObject {

    width = 720;                       // Breite der Hintergrundobjekte
    heigth = 480;                      // Höhe der Hintergrundobjekte
    constructor(imagePath, x) {
        super().loadImage(imagePath);  // Pfad zu den Bildern der Hintergrundobjekte
        this.x = x;                    // x-Position des Hintergrundobjektes
        this.y = 480 - this.heigth;    // y-Position des Hintergrundobjektes (Canvas-Höhe - Höhe des Objektes = Startposition Bild)       
    }
}