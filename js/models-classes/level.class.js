class level {
    enemies;
    bottles;
    clouds;
    backgroundObjects;
    levelEndX = 2000;    // Endpunkt für Laufen nach RECHTS 

    constructor (enemies, bottles, clouds, backgroundObjects) {
        this.enemies = enemies ;
        this.bottles = bottles;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }
}  