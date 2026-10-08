var runtimeImageCache = {};
var runtimeImagePromises = {};

/** Returns one shared runtime image instance for the requested asset path. */
function getRuntimeImage(path) {
    if (runtimeImageCache[path]) return runtimeImageCache[path];
    var image = new Image();
    runtimeImageCache[path] = image;
    image.src = path;
    return image;
}

/** Resolves after one shared runtime image has loaded and decoded. */
function preloadRuntimeImage(path) {
    if (runtimeImagePromises[path]) return runtimeImagePromises[path];
    var image = getRuntimeImage(path);
    var request = waitForRuntimeImage(image, path);
    runtimeImagePromises[path] = request;
    request.catch(function () {
        delete runtimeImagePromises[path];
        delete runtimeImageCache[path];
    });
    return request;
}

/** Waits for the browser to finish loading one runtime image. */
function waitForRuntimeImage(image, path) {
    if (image.complete && image.naturalWidth > 0) {
        return decodeRuntimeImage(image);
    }
    if (image.complete) return Promise.reject(new Error("Image failed to load: " + path));
    return new Promise(function (resolve, reject) {
        image.addEventListener("load", function () {
            decodeRuntimeImage(image).then(resolve).catch(reject);
        }, { once: true });
        image.addEventListener("error", function () {
            reject(new Error("Image failed to load: " + path));
        }, { once: true });
    });
}

/** Decodes one loaded image before it becomes startup-ready. */
function decodeRuntimeImage(image) {
    if (typeof image.decode !== "function") return Promise.resolve(image);
    return image.decode().then(function () {
        return image;
    });
}

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
        this.img = getRuntimeImage(path);
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
            this.imageCache[path] = getRuntimeImage(path);
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
