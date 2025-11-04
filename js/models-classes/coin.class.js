class Coin extends MovableObject {

    // Grundabmessungen
    width = 80;
    heigth = 80;

    // Zustand
    collected = false;

    // Dreh-Parameter
    baseWidth = 80;        // Referenzbreite für die "Drehung"
    rotationAngle = 0;     // aktueller Winkel
    rotationSpeed = 0.08;  // Drehgeschwindigkeit (kleiner = langsamer)

    // feste Drehachse (Mitte)
    centerX = 0;
    centerY = 0;

    constructor(x, y) {
        super().loadImage('./assets/img/8_muenzen/coin_2.png');

        // Startposition (entweder Vorgabe oder zufällig)
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

        // Basen setzen
        this.baseWidth = this.width;
        this.centerX = this.x + this.width / 2;
        this.centerY = this.y + this.heigth / 2;

        // optional: zufäll iger Startwinkel, damit nicht alle gleich laufen
        this.rotationAngle = Math.random() * Math.PI * 2;

        this.startSpin();
    }

    // Startet die „3D“-Drehsimulation um die eigene Mittelachse
    startSpin() {
        var self = this;
        this.spinInterval = soundHub.registerInterval(setInterval(function () {
            // Winkel erhöhen
            self.rotationAngle += self.rotationSpeed;

            // sichtbare Breite als |cos(θ)| (Kantenansicht wird schmal)
            var scale = Math.abs(Math.cos(self.rotationAngle));
            var newWidth = self.baseWidth * scale;

            // Minimalbreite gegen Flackern (nie 0 werden lassen)
            if (newWidth < 6) {
                newWidth = 6;
            }

            // Breite setzen und X so korrigieren, dass die MITTE fix bleibt
            self.width = newWidth;
            self.x = self.centerX - self.width / 2;

            // kleines „Schweben“ (optional): +/- 2px um die vertikale Mitte
            var bob = Math.sin(self.rotationAngle * 2) * 2;
            self.y = self.centerY - self.heigth / 2 + bob;
        }, 50));
    }
}
