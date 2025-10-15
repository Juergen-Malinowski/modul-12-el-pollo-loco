
// mit "extends MovableObject" wird die Klasse "character" von der 
// Klasse "MovableObject" abgeleitet ...

class Character extends MovableObject {

    heigth = 330;   // Höhe des Charakters
    width = 150;    // Breite des Charakters
    y = 130;        // Startposition des Charakters auf der Y-Achse

    constructor () {
        super().loadImage('../assets/img/2_charakter_pepe/2_walk/W-21.png')
    }


    jump() {

    }
}