
const level1 = new level(
    [
        new Chicken(),
        new Chicken(),
        new Chicken(),
    ],
    [
        new Cloud(),
    ],
    [
        // Einfügen TEIL 2 (links) des START-Hintergrundes ... ACHTUNG, X-Startpunkt -720 (720px VOR Bild 1) ...        
        new BackgroundObject('../assets/img/5_hintergrund/layers/air.png', -720),
        new BackgroundObject('../assets/img/5_hintergrund/layers/3_third_layer/2.png', -720),
        new BackgroundObject('../assets/img/5_hintergrund/layers/2_second_layer/2.png', -720),
        new BackgroundObject('../assets/img/5_hintergrund/layers/1_first_layer/2.png', -720),
        // START-SCREEC vom Game ...
        new BackgroundObject('../assets/img/5_hintergrund/layers/air.png', 0),
        new BackgroundObject('../assets/img/5_hintergrund/layers/3_third_layer/1.png', 0),
        new BackgroundObject('../assets/img/5_hintergrund/layers/2_second_layer/1.png', 0),
        new BackgroundObject('../assets/img/5_hintergrund/layers/1_first_layer/1.png', 0),
        // Einfügen TEIL 2 (rechts) des START-Hintergrundes ... ACHTUNG, X-Startpunkt 720 (am Ende Bild 1) ...
        new BackgroundObject('../assets/img/5_hintergrund/layers/air.png', 720),
        new BackgroundObject('../assets/img/5_hintergrund/layers/3_third_layer/2.png', 720),
        new BackgroundObject('../assets/img/5_hintergrund/layers/2_second_layer/2.png', 720),
        new BackgroundObject('../assets/img/5_hintergrund/layers/1_first_layer/2.png', 720),
        // je nach LÄNGE des Levels hier nun wieder START mit dem START-Bildschirm und dann so weiter ...
        new BackgroundObject('../assets/img/5_hintergrund/layers/air.png', 1440),
        new BackgroundObject('../assets/img/5_hintergrund/layers/3_third_layer/1.png', 1440),
        new BackgroundObject('../assets/img/5_hintergrund/layers/2_second_layer/1.png', 1440),
        new BackgroundObject('../assets/img/5_hintergrund/layers/1_first_layer/1.png', 1440),
    ],
);
