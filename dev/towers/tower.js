class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.size = 130;

        this.health = healthConfig.tower;
        this.maxHealth = healthConfig.tower;

        this.img = null;
        this.price = 0;
    }

    draw() {
        
        imageMode(CENTER);
        if (this.img) {
            image(this.img, this.x, this.y, this.size, this.size);
        } else {
            // fallback colored rect if image isn't loaded yet
            var healthRatio = max(0, this.health / this.maxHealth);
            fill(255 * (1 - healthRatio), 100, 255 * healthRatio);
            stroke(0);
            strokeWeight(2);
            rectMode(CENTER);
            rect(this.x, this.y, this.size, this.size);
        }
        drawHealthBar(this.x, this.y, this.size, this.health, this.maxHealth);
    }
}