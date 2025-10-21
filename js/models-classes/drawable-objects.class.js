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
        arr.forEach((path) => {
            let img = new Image();          // Image-Objekt anlegen
            img.src = path;                 // Pfad zuweisen
            this.imageCache[path] = img;    // Bild dem imageCache-Array hinzufügen  
        });
    }    

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y,
            this.width, this.heigth);
    }    
    
    
}