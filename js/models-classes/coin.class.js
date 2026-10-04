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

    constructor(x, y) {
        super().loadImage('./assets/img/8_muenzen/coin_2.png');

        if (typeof x === 'number') {
            this.x = x;
        } else {
            this.x = 300 + Math.random() * 1800;
        }

        if (typeof y === 'number') {
            this.y = y;
        } else {
            this.y = 150 + Math.random() * 200;
        }

        this.baseWidth = this.width;
        this.centerX = this.x + this.width / 2;
        this.centerY = this.y + this.heigth / 2;
        this.rotationAngle = Math.random() * Math.PI * 2;

        this.startSpin();
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
