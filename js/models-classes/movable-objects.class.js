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
    correntImage = 0;        // Nr. aktuelles Bildes der Animation   
    energie = 100;           // Lebens-ENERGIE (Gesundheit, Trefferpunkte)
    lastHit = 0;             // speichert, dass ein Treffer erfolgte (für spätere Animation Verletzung)



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

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y,
            this.width, this.heigth);
    }

    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken || this instanceof Endboss) {
            // Collisions-RAHMEN nur um Charakter, Chicken und Endboss ...
            ctx.beginPath();
            ctx.linewidth = "20";
            ctx.strokeStyle = "blue";
            ctx.rect(this.x, this.y, this.width, this.heigth);
            ctx.stroke();
        }
    }

    isColliding(movableObject) {
        // PRÜFEN, ob ein bewegliches Objekt mit dem Charakter kollidiert ...
        return this.x + this.width - this.offset.right > movableObject.x + movableObject.offset.left &&
            this.y + this.heigth - this.offset.buttom > movableObject.y + movableObject.offset.top &&
            this.x + this.offset.left < movableObject.x - movableObject.offset.right &&
            this.y + this.offset.top < movableObject.y + movableObject.heigth - movableObject.offset.buttom;
    }

    wasHit() {
        // Schadenverarbeitung ...
        this.energie -= 10;       // ENERGIE abziehen pro Zeiteinheit ms
        if (this.energie < 0) {
            this.energie = 0;    // Minimum ist 0 Energie
        } else {
            this.lastHit = new Date().getTime();  // "Date()" und "getTime()" halten Zeitpunkt Treffer fest ... speichert in "lastHit"
        }
    }

    isHurt() {
        let passedTime = new Date().getTime() - this.lastHit;    // Differenz im ms zwischen letzten Treffer und aktueller Zeit
        passedTime = passedTime / 1000;                          // aus ms (Milli-Sekunden) werden Sekunden
        return passedTime < 1;                                   // wird TRUE, wenn seit letzten Treffer weniger als 3 Sek. vergangen, sonst FALSE
    }

    isDead() {
        return this.energie == 0;
    }

    playAnimation(images) {
        // WALK-ANIMATION ...
        // %-Zeichen ist der "Modulo"-Operator (Restwert einer Division) ...
        // correntImage beginnt bei 0 und imageWalking.length ist 6 (Anzahl der Bilder der Animation)
        // i wird dann 0,1,2,3,4,5 und beginnt dann wieder bei 0,1,2,3,4,5 usw.        
        if (!images || images.length === 0) return;  // Sicherheitscheck
        let i = this.correntImage % images.length;  
        let path = images[i];
        let img = this.imageCache[path];
        if (img) {
            this.img = img;                          // nur gültige Bilder übernehmen
        }
        this.correntImage++;
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