
let level1;

function initLevel() {
    level1 = new level(
        [
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new Chicken(),
            new LittleChicken(),
            new LittleChicken(),
            new LittleChicken(),
            new LittleChicken(),
            new LittleChicken(),
            new Endboss(),
        ],
        [
            new ThrowableObjects(0, 0, true),
            new ThrowableObjects(0, 0, true),
            new ThrowableObjects(0, 0, true),
            new ThrowableObjects(0, 0, true),
            new ThrowableObjects(0, 0, true),
            new ThrowableObjects(0, 0, true),
        ],

        [
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
            new Coin(),
        ],

        [
            new Cloud(-200, 60),
            new Cloud(450, 50),
            new Cloud(900, 70),
            new Cloud(1650, 55),
            new Cloud(1440, 70),
            new Cloud(120, 40),
            new Cloud(1250, 20),
            new Cloud(1950, 15),
        ],
        [
            // Einfügen TEIL 2 (links) des START-Hintergrundes ... ACHTUNG, X-Startpunkt -720 (720px VOR Bild 1) ...        
            new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', -720),
            new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/2.png', -720),
            new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/2.png', -720),
            new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/2.png', -720),
            // START-SCREEC vom Game ...
            new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 0),
            new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/1.png', 0),
            new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/1.png', 0),
            new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/1.png', 0),
            // Einfügen TEIL 2 (rechts) des START-Hintergrundes ... ACHTUNG, X-Startpunkt 720 (am Ende Bild 1) ...
            new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 720),
            new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/2.png', 720),
            new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/2.png', 720),
            new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/2.png', 720),
            // je nach LÄNGE des Levels hier nun wieder START ...
            new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 1440),
            new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/1.png', 1440),
            new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/1.png', 1440),
            new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/1.png', 1440),
            // Schwarzes Bild rechts am Spielfeldende vermeiden ...
            new BackgroundObject('./assets/img/5_hintergrund/layers/air.png', 2160),
            new BackgroundObject('./assets/img/5_hintergrund/layers/3_third_layer/2.png', 2160),
            new BackgroundObject('./assets/img/5_hintergrund/layers/2_second_layer/2.png', 2160),
            new BackgroundObject('./assets/img/5_hintergrund/layers/1_first_layer/2.png', 2160),
        ],
    );
}