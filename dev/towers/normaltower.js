// Tower Subclasses
class NormalTower extends Tower {
    constructor(x, y) {
        super(x, y);

        this.img = towerImages.normal;
        this.price = 50;

        this.attackRange = 350;
        this.attackCooldown = 60; // frames (1 shot/sec)
        this.lastShotFrame = -999;
    }

    update() {
        if (frameCount - this.lastShotFrame < this.attackCooldown) return;

        var target = null;
        var closest = Infinity;
        
        for (var i = 0; i < enemies.length; i++) {
            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);

            if (d <= this.attackRange && d < closestDist) {
                closestDist = d;
                target = enemies[i];
            }
        }

        if (target !== null) {
            arrows.push(new Arrow(this.x, this.y, closest.x, closest.y));
            this.lastShotFrame = frameCount;
        }
    }
}