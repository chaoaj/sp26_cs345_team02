class ExplosiveTower extends Tower {
    constructor(x, y) {
        super(x, y);

        this.img = towerImages.explosive;
        this.price = 250;
        // how far away an enemy can be before this tower targets it
        this.attackRange = 300;
        // minimum frames between shots prevents firing every frame
        this.attackCooldown = 120; // frames (2s at 60fps)
        // initialized far in the past so the tower can fire immediately on placement
        this.lastShotFrame = -999;

        var cs = towerUpgrades.ExplosiveTower.currentStats;
        this.explosionRadius = cs.explosionRadius;
        this.damage = cs.damage;
    }

    update() {
        // wait for the cooldown before firing again
        if (frameCount - this.lastShotFrame < this.attackCooldown) return;

        // find the closest enemy within attack range
        var closest = null;
        var closestDist = Infinity;

        for (var i = 0; i < enemies.length; i++) {
            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);

            if (d <= this.attackRange && d < closestDist) {
                closestDist = d;
                closest = enemies[i];
            }
        }

        // fire a projectile at the target's current position and reset the cooldown
        if (closest !== null) {
            explosives.push(
                new Explosive(this.x, this.y, closest.x, closest.y,
                              this.explosionRadius, this.damage, this)
            );
            this.lastShotFrame = frameCount;
        }
    }
}
