class DrawableObjects {
    x = 50;
    y = 300;
    heigth = 150;
    width = 100;
    img;
    imageCache = {};         // speichert die Pfade zu den Bilddateien
    correntImage = 0;        // Nr. aktuelles Bildes der Animation      


    loadImage(path) {
        this.img = new Image();  // Image-Objekt anlegen
        this.img.src = path;     // Pfad zuweisen
    }

    // Pfad zu den Bildern der Objekte zuweisen ...
    loadImages(arr) {
        // Sicherheitsprüfung: nur arbeiten, wenn ein echtes Array übergeben wurde
        if (!Array.isArray(arr)) {
            console.warn('loadImages: Erwartet wurde ein Array, erhalten:', arr);
            return; // sauber abbrechen, kein Fehler
        }

        arr.forEach(function (path) {
            let img = new Image();          // Image-Objekt anlegen
            img.src = path;                 // Pfad zuweisen
            this.imageCache[path] = img;    // Bild dem imageCache-Array hinzufügen
        }, this);
    }
 

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y,
            this.width, this.heigth);
    }

    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken || this instanceof Endboss || this instanceof ThrowableObjects) {
            // Collisions-RAHMEN nur um Charakter, Chicken und Endboss ...
            ctx.beginPath();
            ctx.linewidth = "20";
            ctx.strokeStyle = "blue";
            ctx.rect(this.x, this.y, this.width, this.heigth);
            ctx.stroke();
        }
    }

}