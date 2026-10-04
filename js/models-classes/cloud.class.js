class Cloud extends MovableObject {

    speed = 0.2;
    animationInterval = null;

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
        this.animationInterval = soundHub.registerInterval(setInterval(() => {
            this.moveLeft();
        }, 100));
    }
}
