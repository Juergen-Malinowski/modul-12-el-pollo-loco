class Chicken extends MovableObject {

    heigth = 70;
    width = 70;
    y = 380;
    speed = 0.3;

    offset = {
        top: 5,
        buttom: 5,
        left: 5,
        right: 5,
    };

    imagesWalking = [
        './assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png',
        './assets/img/3_feinde_huehner/chicken_normal/1_walk/2_w.png',
        './assets/img/3_feinde_huehner/chicken_normal/1_walk/3_w.png',
    ];

    imageDead = './assets/img/3_feinde_huehner/chicken_normal/2_dead/dead.png';
    isDeadChicken = false;

    constructor() {
        super().loadImage('./assets/img/3_feinde_huehner/chicken_normal/1_walk/1_w.png');
        this.x = 450 + Math.random() * 1400;
        this.speed = 0.2 + Math.random() * 0.3;
        this.loadImages(this.imagesWalking);
        this.animate();
    }

    /**
     * Starts movement and walking animation loops for the chicken.
     */
    animate() {
        soundHub.registerInterval(setInterval(() => {
            if (!this.isDeadChicken) {
                this.moveLeft();
            }
        }, 1000 / 60));

        soundHub.registerInterval(setInterval(() => {
            if (!this.isDeadChicken) {
                this.playAnimation(this.imagesWalking);
            }
        }, 120));
    }

    /**
     * Stops movement and switches to the dead chicken image.
     */
    die() {
        this.isDeadChicken = true;
        this.loadImage(this.imageDead);
        this.speed = 0;
    }
}
