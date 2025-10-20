class MovableObject {
    x = 50;
    y = 300;
    img;
    heigth = 150;
    width = 100;
    imageCache = {};         // speichert die Pfade zu den Bilddateien
    speed = 0.1;             // Modify-Faktor für Wolkenbewegung
    otherDirection = false;  // in welche Richtigung bewegt sich das Objekt ... FALSE = nach rechts
    speedY = 0;              // Start Fallgeschwindigkeit
    acceleration = 4;        // Beschleunigung im Fall
    correntImage = 0;   // Nr. aktuelles Bildes der Animation        

    isAboveGround() {
        // GIBT den Punkt zurück, an dem das Objekt den Boden berührt und Fall abgeschlossen ist
        return this.y < 130;
    }

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                // nur solange der Charakter noch nicht den BODEN erreicht hat ...
                this.y -= this.speedY;              // Fallgeschwindigkeit übergeben
                this.speedY -= this.acceleration;   // Erhöhung Fallgeschwindigkeit
            }
        }, 30);
    }

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

    playAnimation(images) {
        // WALK-ANIMATION ...
        // %-Zeichen ist der "Modulo"-Operator (Restwert einer Division) ...
        // correntImage beginnt bei 0 und imageWalking.length ist 6 (Anzahl der Bilder der Animation)
        // i wird dann 0,1,2,3,4,5 und beginnt dann wieder bei 0,1,2,3,4,5 usw.
        let i = this.correntImage % this.imagesWalking.length;
        let path = images[i];  // Pfad des aktuellen Bildes der Animation
        this.img = this.imageCache[path];  // Pfad des Bildes der Animation laden
        this.correntImage++;               // Nr. des aktuellen Bildes der Animation erhöhen
    }

    moveLeft() {
        // Bewegung nach LINKS ...
        this.x -= this.speed;      // Modifikation der x-Position (Wolke bewegt sich nach links)
    }

    moveRight() {
        // Bewegung nach RECHTS ...
        this.x += this.speed;
    }

    jump() {
        // Sprung nach oben ...
        this.speedY = 45;
    }


}