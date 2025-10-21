class StatusBar extends DrawableObjects {

    healthPercentage = 100;    // volle Gesundheit 100 %

    // Statusbar Gesundheit Charakter ...
    imagesHealth = [
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
        'assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png',
    ]

    constructor() {
        super();
        this.loadImages(this.imagesHealth);
        this.x = 10;                          // Position X der Statusbar
        this.y = 10;                          // Position Y der Statusbar
        this.width = 150;                     // Breite Statusbar
        this.heigth = 50;                     // Höhe Statusbar
        this.setPercentage(100);              // setze zu Spielbeginn Wert auf 100 %
    }

    // setPercentage(50)  =  Gesundheit wird auf 50 % gesetzt
    setPercentage(healthPercentage) {
        // AKTUELLE Lebenspunkte "healthPercentage" ziehen und Bild Statusbar zuordnen ...
        this.healthPercentage = healthPercentage;
        let path = this.imagesHealth[this.getImageIndex()];
        this.img = this.imageCache[path];
    }

    getImageIndex() {
        // WELCHE Statusbar "imagesHealth" gehört zu aktuellen Lebenspunkten "healthPercentage" ...
        if (this.healthPercentage >= 100) return 0;
        else if (this.healthPercentage >= 80) return 1;
        else if (this.healthPercentage >= 60) return 2;
        else if (this.healthPercentage >= 40) return 3;
        else if (this.healthPercentage >= 20) return 4;
        else return 5;
    }
};



