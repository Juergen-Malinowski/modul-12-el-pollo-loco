class StatusBar extends DrawableObjects {

    percentage = 100;    // generische Prozentanzeige
    images = [];         // Bildliste (wird dynamisch befüllt)

    constructor(type = 'health') {
        super();

        var defaultPercentage = 100; // Startwert (kann je nach Typ überschrieben werden)

        if (type === 'health') {
            // === STATUSBAR LEBENSENERGIE ===
            this.images = [
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png'
            ];
            this.x = 10;
            this.y = 10;
            defaultPercentage = 100;
        }

        if (type === 'bottle') {
            // === STATUSBAR FLASCHEN ===
            this.images = [
                './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png',
                './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
                './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
                './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
                './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
                './assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png'
            ];
            this.x = 10;
            this.y = 70;
            defaultPercentage = 0; // Flaschen beginnen leer
        }

        if (type === 'coins') {
            // === STATUSBAR MÜNZEN ===
            // Reihenfolge jetzt korrekt: 100 → 0 Prozent
            this.images = [
                './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png',
                './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
                './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
                './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
                './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
                './assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png'
            ];
            this.x = 10;
            this.y = 130;    // unter Flaschen-Bar
            defaultPercentage = 0; // Münzen starten leer
        }

        if (type === 'endboss') {
            // === STATUSBAR ENDBOSS ===
            this.images = [
                './assets/img/7_statusbars/2_statusbar_endboss/green/green100.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green80.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green60.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green40.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green20.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green0.png'
            ];
            this.x = 10;
            this.y = 190;
            defaultPercentage = 100;
        }

        this.width = 150;
        this.heigth = 50;

        this.loadImages(this.images);
        this.setPercentage(defaultPercentage); // jetzt korrekt initialisiert
    }

    setPercentage(percentage) {
        this.percentage = percentage;
        var path = this.images[this.getImageIndex()];
        this.img = this.imageCache[path];
    }

    getImageIndex() {
        if (this.percentage >= 100) return 0;
        else if (this.percentage >= 80) return 1;
        else if (this.percentage >= 60) return 2;
        else if (this.percentage >= 40) return 3;
        else if (this.percentage >= 1) return 4;
        else return 5;
    }
}
