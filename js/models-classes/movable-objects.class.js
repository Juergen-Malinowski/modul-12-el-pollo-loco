class MovableObject {
    x = 50;
    y = 300;
    img;
    heigth = 150;
    width = 100;

    // Pfad zu den Bildern der Objekte zuweisen ...
    loadImage(path) {
        this.img = new Image();  // Image-Objekt anlegen
        this.img.src = path;     // Pfad zuweisen
    }

    moveRight() {
        console.log("Moving right");

    }

    moveLeft() {

    }
}