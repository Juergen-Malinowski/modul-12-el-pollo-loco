/**
 * Provides image loading and canvas drawing behavior for visible game objects.
 */
class DrawableObjects {
    x = 50;
    y = 300;
    heigth = 150;
    width = 100;
    img;
    imageCache = {};
    correntImage = 0;

    /**
     * Loads one image as the object's current drawable image.
     *
     * @param {string} path - Image asset path.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Preloads an animation image sequence into the image cache.
     *
     * @param {string[]} arr - Image asset paths.
     */
    loadImages(arr) {
        if (!Array.isArray(arr)) {
            return;
        }

        arr.forEach(function (path) {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        }, this);
    }

    /**
     * Draws the current image and rotates objects flagged as lying dead.
     *
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context.
     */
    draw(ctx) {
        if (this.isLyingDead) {
            ctx.save();

            let centerX = this.x + this.width / 2;
            let centerY = this.y + this.heigth / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(
                this.img,
                -this.heigth / 2,
                -this.width / 2,
                this.heigth,
                this.width
            );

            ctx.restore();
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.heigth);
        }
    }
}
