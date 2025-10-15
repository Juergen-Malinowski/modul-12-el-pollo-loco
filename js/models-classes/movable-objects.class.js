class MovableObject {
    x = 50;
    y = 300;
    img;
    heigth = 150;
    width = 100;
    imageCache = {};

    correntImage = 0;   // Nr. aktuelles Bildes der Animation        

    loadImage(path) {
        this.img = new Image();  // Image-Objekt anlegen
        this.img.src = path;     // Pfad zuweisen
    }


    // Pfad zu den Bildern der Objekte zuweisen ...
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();          // Image-Objekt anlegen
            img.src = path;                 // Pfad zuweisen
            this.imageCache[path] = img;    // Bild dem imageCache-Array hinzufügen  
        });
    }


    moveRight() {
        console.log("Moving right");

    }

    moveLeft() {

    }
}