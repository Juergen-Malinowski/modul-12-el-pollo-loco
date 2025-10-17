class level {
    enemies;
    clouds;
    backgroundObjects;
    levelEndX = 1600;    // Endpunkt für Laufen nach RECHTS 

    constructor (enemies, clouds, backgroundObjects) {
        this.enemies = enemies ;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }
}