class MovableObject extends DrawableObjects {


    speed = 0.1;             // Modify-Faktor für Wolkenbewegung
    otherDirection = false;  // in welche Richtigung bewegt sich das Objekt ... FALSE = nach rechts
    speedY = 0;              // Start Fallgeschwindigkeit
    acceleration = 4;        // Beschleunigung im Fall

    energie = 100;           // Lebens-ENERGIE (Gesundheit, Trefferpunkte)
    lastHit = 0;             // speichert, dass ein Treffer erfolgte (für spätere Animation Verletzung)
    offset = {               // Korrektur der Kollision auf den tatsächlichen Körper !
        top: 0,
        buttom: 0,
        left: 0,
        right: 0,
    }

    // chickenCry = new Audio('assets/sound/chicken-1.mp3');   // aufgeregtes Huhn


    isAboveGround() {
        // WENN ein "ThrowableObjects", DANN sofort RETURN ... 
        if (this instanceof ThrowableObjects) {
            return true;                            // ABBRUCH der Funktion !
        } else {
            // GIBT den Punkt zurück, an dem das Objekt den Boden berührt und Fall abgeschlossen ist ...
            return this.y < 130;
        }
    }

    applyGravity() {
        soundHub.registerInterval(setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 30));
    }


    isColliding(movableObject) {
        // Fall 1: Wenn das Objekt eine Flasche (ThrowableObjects) ist ...
        if (movableObject instanceof ThrowableObjects) {
            // Bei Flaschen (ThrowableObjects) ist die Y-Position meist tiefer als beim Charakter.
            // Deshalb eigene Rechteck-basierte Kollision (analog zu den beweglichen Objekten)...
            return (
                this.x + this.width > movableObject.x + movableObject.offset.left &&     // rechter Rand des Charakters erreicht linke Seite der Flasche
                this.y + this.heigth >= movableObject.y
            );
        }


        // Fall 2: Standardkollision für bewegliche Objekte (Character, Chicken, Endboss, etc.) ...
        return (
            this.x + this.width - this.offset.right > movableObject.x + movableObject.offset.left &&
            this.x + this.offset.left < movableObject.x + movableObject.width - movableObject.offset.right &&
            this.y + this.heigth - this.offset.buttom > movableObject.y + movableObject.offset.top &&
            this.y + this.offset.top < movableObject.y + movableObject.heigth - movableObject.offset.buttom
        );
    }

    // Datei: js/models-classes/movable-objects.class.js

    wasHit() {
        // Schnarchen-Audio beenden ...
        if (this instanceof Character && typeof soundHub !== "undefined" && soundHub && typeof soundHub.stopSnoring === "function") {
            try { soundHub.stopSnoring(); } catch (e) { }
        }
        // Spieler als "aktiv" markieren, damit Idle/Long-Idle nicht sofort nachrücken ...
        if (this instanceof Character) {
            try { this.lastActionTime = Date.now(); } catch (e) { }
        }

        // Schadenverarbeitung ...
        this.energie -= 1;    // ENERGIE abziehen ...
        if (this.energie < 0) {
            this.energie = 0; // Minimum ist 0 ...
        } else {
            this.lastHit = new Date().getTime();  // Zeitpunkt Treffer speichern ...
        }
    }

    isHurt() {
        // Zeitverzögerung nach Verletzung ...
        let passedTime = new Date().getTime() - this.lastHit;    // Differenz im ms zwischen letzten Treffer und aktueller Zeit
        passedTime = passedTime / 1000;                          // aus ms (Milli-Sekunden) werden Sekunden
        return passedTime < 3;                                   // wird TRUE, wenn seit letzten Treffer weniger als 3 Sek. vergangen, sonst FALSE
    }





    isDead() {
        return this.energie == 0;
    }

    playAnimation(images) {
        // Wenn der Charakter gerade wirft oder stirbt → KEINE anderen Animationen zeigen ...
        if (this.isThrowing || this.isDeadAnimationPlaying) {
            return; // stoppt Beinbewegung & Idle-Frames während des Wurfes / Todes
        }
        // Sicherheitsprüfung: nur arbeiten, wenn ein gültiges Array übergeben wurde ...
        if (!images || images.length === 0) return;
        // Nächsten Frame aus der Bildsequenz berechnen ...
        let i = this.correntImage % images.length;
        let path = images[i];
        let img = this.imageCache[path];
        // Nur gültige Bilder übernehmen ...
        if (img) {
            this.img = img;
        }
        this.correntImage++;
    }

    moveLeft() {
        // Bewegung nach LINKS ...
        this.x -= this.speed;
        // Schnarchen sofort stoppen, wenn Pepe sich bewegt ...
        if (this instanceof Character && typeof this.stopSnoringSound === "function") {
            this.stopSnoringSound();
        }
    }

    moveRight() {
        // Bewegung nach RECHTS ...
        this.x += this.speed;
        // Schnarchen sofort stoppen, wenn Pepe sich bewegt ...
        if (this instanceof Character && typeof this.stopSnoringSound === "function") {
            this.stopSnoringSound();
        }
    }

    jump() {
        // Sprung nach oben ...
        this.speedY = 45;
        // Schnarchen sofort stoppen, wenn Pepe springt ...
        if (this instanceof Character && typeof this.stopSnoringSound === "function") {
            this.stopSnoringSound();
        }
    }
}