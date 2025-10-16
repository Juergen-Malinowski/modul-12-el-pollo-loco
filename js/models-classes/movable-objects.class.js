class MovableObject {
    x = 50;
    y = 300;
    img;
    heigth = 150;
    width = 100;
    imageCache = {};
    speed = 0.1;

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


    moveLeft() {
        setInterval(() => {
            this.x -= this.speed;  // Modifikation der x-Position (Wolke bewegt sich nach links)
            // (17ms = 0,017s bzw. 60 Frames pro Sek. bzw. 1000/60 = 17 ms / 60 Frames pro Sek. ist so das Maximum in Spielen)
        }, 1000 / 60);                 // Intervall in ms (17 ms hier), in der die Wolke neu gezeichnet wird 
    }

    moveRight() {
        console.log("Moving right");

    }

}