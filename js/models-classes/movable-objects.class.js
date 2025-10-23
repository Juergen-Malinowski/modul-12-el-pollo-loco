class MovableObject extends DrawableObjects {


    speed = 0.1;             // Modify-Faktor für Wolkenbewegung
    otherDirection = false;  // in welche Richtigung bewegt sich das Objekt ... FALSE = nach rechts
    speedY = 0;              // Start Fallgeschwindigkeit
    acceleration = 4;        // Beschleunigung im Fall

    energie = 100;           // Lebens-ENERGIE (Gesundheit, Trefferpunkte)
    lastHit = 0;             // speichert, dass ein Treffer erfolgte (für spätere Animation Verletzung)

    // chickenCry = new Audio('assets/sound/chicken-1.mp3');   // aufgeregtes Huhn



    isAboveGround() {
        // WENN ein "ThrowableObjects", DANN sofort RETURN ... 
        if (this instanceof ThrowableObjects) {
            return true;  // ABBRUCH der Funktion !
        } else {
            // GIBT den Punkt zurück, an dem das Objekt den Boden berührt und Fall abgeschlossen ist
            return this.y < 130;
        }
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

    isColliding(movableObject) {
        // Wenn das übergebene Objekt keine "offset"-Eigenschaft besitzt, Standardwerte anlegen
        if (!movableObject.offset) {
            movableObject.offset = { top: 0, buttom: 0, left: 30, right: 0 };
        }

        // Fall 1: Wenn das Objekt eine Flasche (ThrowableObjects) ist ...
        if (movableObject instanceof ThrowableObjects) {
            // Bei Flaschen (ThrowableObjects) ist die Y-Position meist tiefer als beim Charakter.
            // Deshalb eigene Rechteck-basierte Kollision (analog zu den beweglichen Objekten).

            return (
                this.x + this.width > movableObject.x + movableObject.offset.left &&     // rechter Rand des Charakters erreicht linke Seite der Flasche
                this.y + this.heigth >= movableObject.y
            );
        }


        // Fall 2: Standardkollision für bewegliche Objekte (Character, Chicken, Endboss, etc.)
        return (
            this.x + this.width - this.offset.right > movableObject.x + movableObject.offset.left &&
            this.x + this.offset.left < movableObject.x + movableObject.width - movableObject.offset.right &&
            this.y + this.heigth - this.offset.buttom > movableObject.y + movableObject.offset.top &&
            this.y + this.offset.top < movableObject.y + movableObject.heigth - movableObject.offset.buttom
        );
    }

    wasHit() {
        // Schadenverarbeitung ...
        this.energie -= 1;       // ENERGIE abziehen pro Zeiteinheit ms
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
        this.x -= this.speed;      // Modifikation der x-Position 
    }

    moveRight() {
        // Bewegung nach RECHTS ...
        this.x += this.speed;      // Modifikation der x-Position 
    }

    jump() {
        // Sprung nach oben ...
        this.speedY = 45;
    }


}