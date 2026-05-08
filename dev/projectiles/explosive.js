// Projectile fired by ExplosiveTower. Travels to a fixed target position, then
// deals AOE damage to all enemies within explosionRadius on arrival.
class Explosive {
    constructor(x, y, targetX, targetY, explosionRadius, damage, tower = null) {
        this.tower = tower;
        this.x = x;
        this.y = y;

        // position locked at fire time does not track the enemy after launch
        this.targetX = targetX;
        this.targetY = targetY;

        this.explosionRadius = explosionRadius;
        this.damage = damage;

        this.speed = 8; // pixels per frame
        this.exploded = false;
        this.explosionFrame = -1;
        // how many frames the explosion visual stays on screen before removal
        this.explosionDuration = 20;
    }

    update() {
        if (this.exploded) return;

        var d = dist(this.x, this.y, this.targetX, this.targetY);

        // snap to target when closer than one step to avoid overshooting
        if (d < this.speed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.explode();
        } else {
            var angle = atan2(this.targetY - this.y, this.targetX - this.x);
            this.x += cos(angle) * this.speed;
            this.y += sin(angle) * this.speed;
        }
    }

    explode() {


        if (frameCount - lastEnemyHitSoundFrame > 4) {
            let explosionSFX = new Audio(explosionSound.src);
        
            explosionSFX.volume = 0.08;
            explosionSFX.play();

            lastEnemyHitSoundFrame = frameCount;

        }


        this.exploded = true;
        this.explosionFrame = frameCount;

        // iterate backwards so splicing doesn't skip enemies
        for (var i = enemies.length - 1; i >= 0; i--) {
            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);

            if (d <= this.explosionRadius) {
                enemies[i].health -= this.damage;

                if (enemies[i].health <= 0) {
                    // free any troop locked in combat so it isn't left with a stale reference
                    if (enemies[i].engagedTroop !== null) {
                        enemies[i].engagedTroop.engagedEnemy = null;
                    }
                    enemyKilled(i, this.tower);
                }
            }
        }
    }

    draw() {
        if (!this.exploded) {
            // in-flight projectile
            fill(255, 100, 0);
            noStroke();
            ellipse(this.x, this.y, 16, 16);
        } else {
            // expanding ring that fades out over explosionDuration frames
            var age = frameCount - this.explosionFrame;

            if (age < this.explosionDuration) {
                var progress = age / this.explosionDuration;
                var radius = this.explosionRadius * progress;

                var alpha = 255 * (1 - progress);
                noStroke();
                fill(255, 60, 0, alpha);
                ellipse(this.x, this.y, radius * 2, radius * 2);
            }
        }
    }

    // update updateExplosives() that this object can be removed from the array
    isDone() {
        return this.exploded && (
            frameCount - this.explosionFrame >= this.explosionDuration);
    }
}