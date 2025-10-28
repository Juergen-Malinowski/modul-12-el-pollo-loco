class level {
    enemies;
    bottles;
    coins;               // 🟡 Neu: Coins-Feld ergänzen
    clouds;
    backgroundObjects;
    levelEndX = 2000;    // Endpunkt für Laufen nach RECHTS 

    constructor(enemies, bottles, coins, clouds, backgroundObjects) {
        this.enemies = enemies;
        this.bottles = bottles;
        this.coins = coins || [];             // Fallback, falls keine Münzen übergeben werden
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
    }
}
 