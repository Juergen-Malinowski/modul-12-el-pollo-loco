/**
 * Displays image-based status values for health, bottles, coins, and the end boss.
 */
class StatusBar extends DrawableObjects {

    percentage = 100;
    images = [];

    /**
     * Creates a status bar for the requested game resource.
     *
     * @param {'health'|'bottle'|'coins'|'endboss'} type - Status bar type.
     */
    constructor(type = 'health') {
        super();
        var config = this.getStatusBarConfig(type);
        this.applyStatusBarConfig(config);
    }

    /** Returns the configuration for the requested status bar type. */
    getStatusBarConfig(type) {
        if (type === 'health') return this.getHealthConfig();
        if (type === 'bottle') return this.getBottleConfig();
        if (type === 'coins') return this.getCoinConfig();
        if (type === 'endboss') return this.getEndbossConfig();
        return { images: [], x: undefined, y: undefined, defaultPercentage: 100 };
    }

    /** Returns the health status bar configuration. */
    getHealthConfig() {
        return {
            images: [
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/20.png',
                './assets/img/7_statusbars/1_statusbar/2_statusbar_health/orange/0.png'
            ],
            x: 10,
            y: 10,
            defaultPercentage: 100
        };
    }

    /** Returns the segmented bottle status configuration. */
    getBottleConfig() {
        return {
            images: [],
            x: 10,
            y: 70,
            defaultPercentage: 0
        };
    }

    /** Returns the segmented coin status configuration. */
    getCoinConfig() {
        return {
            images: [],
            x: 10,
            y: 130,
            defaultPercentage: 0
        };
    }

    /** Returns the Endboss status bar configuration. */
    getEndbossConfig() {
        return {
            images: [
                './assets/img/7_statusbars/2_statusbar_endboss/green/green100.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green80.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green60.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green40.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green20.png',
                './assets/img/7_statusbars/2_statusbar_endboss/green/green0.png'
            ],
            x: 10,
            y: 190,
            defaultPercentage: 100
        };
    }

    /** Applies dimensions, position, images, and initial percentage. */
    applyStatusBarConfig(config) {
        this.images = config.images;
        this.x = config.x;
        this.y = config.y;
        this.width = 150;
        this.heigth = 50;
        if (this.images.length > 0) this.loadImages(this.images);
        this.setPercentage(config.defaultPercentage);
    }

    /**
     * Updates the status value and switches to the corresponding image.
     *
     * @param {number} percentage - Current status percentage.
     */
    setPercentage(percentage) {
        this.percentage = percentage;
        if (this.images.length === 0) return;
        var path = this.images[this.getImageIndex()];
        this.img = this.imageCache[path];
    }

    /**
     * Maps the current percentage to its status image index.
     *
     * @returns {number} Image index for the current percentage range.
     */
    getImageIndex() {
        if (this.percentage >= 100) return 0;
        else if (this.percentage >= 80) return 1;
        else if (this.percentage >= 60) return 2;
        else if (this.percentage >= 40) return 3;
        else if (this.percentage >= 1) return 4;
        else return 5;
    }
}
