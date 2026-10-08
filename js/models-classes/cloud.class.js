class Cloud extends MovableObject {

    speed = 0.2;
    animationInterval = null;

    /**
     * Creates one moving background cloud.
     *
     * @param {number} x - Initial horizontal position.
     * @param {number} y - Initial vertical position.
     */
    constructor(x, y) {
        super().loadImage('./assets/img/5_hintergrund/layers/4_clouds/1.png');
        this.x = x;
        this.y = y;
        this.width = 400;
        this.height = 250;
        this.animate();
    }

    /**
     * Moves the cloud continuously as part of the parallax background.
     */
    animate() {
        const cloud = this;
        this.animationInterval = soundHub.registerInterval(setInterval(function () {
            if (typeof isGamePaused === "function" && isGamePaused()) return;
            cloud.moveLeft();
        }, 100));
    }
}
