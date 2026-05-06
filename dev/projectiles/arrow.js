// Arrow fired by NormalTower. Travels to the target's position at fire time;
// deals damage to the first enemy it hits and then removes itself.
class Arrow {
    constructor(x, y, targetX, targetY, tower = null) {
        this.tower = tower;
        this.x = x;
        this.y = y;

        this.targetX = targetX;
        this.targetY = targetY;

        this.angle = atan2(targetY - y, targetX - x);

        this.speed = 18;
        // damage scales with the firing tower's current upgrade level
        this.damage = (tower && tower.damage !== undefined) ? tower.damage : 20;
        this.size = 6;

        this.done = false;

        if (frameCount - lastArrowSoundFrame > 15) {

        let arrowSound = new Audio(arrowProjectileSound.src);

        arrowSound.volume = 0.1;
        arrowSound.play();

        lastArrowSoundFrame = frameCount;
}
    }

    update() {
        if (this.done) return;

        this.x += cos(this.angle) * this.speed;
        this.y += sin(this.angle) * this.speed;

        // hit the first enemy we overlap
        for (var i = enemies.length - 1; i >= 0; i--) {

            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);

            if (d < this.size / 2 + enemies[i].size / 2) {

                enemies[i].health -= this.damage;

                let hitSound = new Audio(enemyHitSound.src);

                hitSound.volume = 0.2;
                hitSound.play();

                if (enemies[i].health <= 0) {
                    enemyKilled(i, this.tower);
                }

                this.done = true;
                return;
            }
        }
    }

    draw() {
        if (this.done) return;
        push();
        translate(this.x, this.y);
        rotate(this.angle);
        fill(139, 100, 30);
        noStroke();
        ellipse(0, 0, 18, 5); // elongated shaft
        fill(180, 60, 30);
        triangle(9, 0, 5, -4, 5, 4); // arrowhead
        pop();
    }

    isDone() {
        return this.done;
    }
}