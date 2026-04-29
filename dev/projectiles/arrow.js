// Arrow fired by NormalTower. Travels to the target's position at fire time;
// deals damage to the first enemy it hits and then removes itself.
class Arrow {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;

        this.targetX = targetX;
        this.targetY = targetY;

        this.angle = atan2(targetY - y, targetX - x);

        this.speed = 12;
        this.damage = 20;
        this.size = 6;

        this.done = false;
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

                if (enemies[i].health <= 0) {
                    enemies.splice(i, 1);
                    playerStats.money += enemyStats.moneyDropped;
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