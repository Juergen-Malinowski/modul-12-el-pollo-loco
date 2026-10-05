/**
 * Represents a collectible coin with a simulated 3D spin animation.
 */
class Coin extends MovableObject {

    width = 80;
    heigth = 80;
    collected = false;

    baseWidth = 80;
    rotationAngle = 0;
    rotationSpeed = 0.08;

    centerX = 0;
    centerY = 0;

    constructor(x, y, levelConfig = getLevelConfig(1)) {
        super().loadImage('./assets/img/8_muenzen/coin_2.png');

        if (typeof x === 'number') {
            this.x = x;
        } else {
            this.x = this.getRandomX(levelConfig);
        }

        if (typeof y === 'number') {
            this.y = y;
        } else {
            this.y = levelConfig.coinMinY + Math.random() * (levelConfig.coinMaxY - levelConfig.coinMinY);
        }

        this.baseWidth = this.width;
        this.centerX = this.x + this.width / 2;
        this.centerY = this.y + this.heigth / 2;
        this.rotationAngle = Math.random() * Math.PI * 2;

        this.startSpin();
    }

    /** Returns a horizontal coin spawn position inside the configured level. */
    getRandomX(levelConfig) {
        const baseLevel = getLevelConfig(1);
        const scale = levelConfig.levelEndX / baseLevel.levelEndX;
        const requestedRange = 1800 * scale;
        const availableRange = Math.max(0, levelConfig.levelEndX - this.width - 300);
        return 300 + Math.random() * Math.min(requestedRange, availableRange);
    }

    /**
     * Simulates coin rotation around a fixed center and adds subtle vertical bobbing.
     */
    startSpin() {
        var self = this;
        this.spinInterval = soundHub.registerInterval(setInterval(function () {
            self.rotationAngle += self.rotationSpeed;

            var scale = Math.abs(Math.cos(self.rotationAngle));
            var newWidth = self.baseWidth * scale;

            if (newWidth < 6) {
                newWidth = 6;
            }

            self.width = newWidth;
            self.x = self.centerX - self.width / 2;

            var bob = Math.sin(self.rotationAngle * 2) * 2;
            self.y = self.centerY - self.heigth / 2 + bob;
        }, 50));
    }
}
