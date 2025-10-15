class Cloud extends MovableObject {



    constructor() {
        super().loadImage('../assets/img/5_hintergrund/layers/4_clouds/1.png');
        // Startposition der Wolken in der linken, oberen Ecke festlegen ...
        this.x = 50 + Math.random() * 150; 
        this.y = 0 + Math.random() * 50;
        this.width = 400 + Math.random() * 100;
        this.animate();
    }

    // Wolken bewegen ...
    animate() {
        setInterval(() => {
            this.x -= 0.2;     // Modifikation der x-Position (Wolke bewegt sich nach links)

        // (17ms = 0,017s bzw. 60 Frames pro Sek. bzw. 1000/60 = 17 ms / 60 Frames pro Sek. ist so das Maximum in Spielen)
    }, 1000 / 60);             // Intervall in ms (17 ms hier), in der die Wolke neu gezeichnet wird 
    };
}

