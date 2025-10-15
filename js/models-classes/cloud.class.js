class Cloud extends MovableObject {



    constructor() {
        super().loadImage('../assets/img/5_hintergrund/layers/4_clouds/1.png');
        // Startposition der Wolken in der linken, oberen Ecke festlegen ...
        this.x = 50 + Math.random() * 150; 
        this.y = 0 + Math.random() * 50;
        this.width = 400 + Math.random() * 100;
    }
}

