class MovableObject {
    x = 120;
    y = 400;
    img;

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