
class HealingTower extends Tower {
    constructor(x, y) {
        super(x, y);

        this.img = towerImages.healing;
        this.price = 100;

        this.healRange = 200;
        this.healRate = 0.1; // 6 HP/sec

        this.target = null;

        this.beamX = null;
        this.beamY = null;
    }

    update() {
        this.beamX = null;
        this.beamY = null;

        // priority 1: player
        if (playerStats.health < playerStats.maxHealth &&
            dist(this.x, this.y, playerStats.x, playerStats.y) <= this.healRange) {

            playerStats.health = min(playerStats.health + this.healRate, playerStats.maxHealth);
            this.beamX = playerStats.x;
            this.beamY = playerStats.y;
            this.target = null;
            return;
        }

        // priority 2: main base
        if (base.health < base.maxHealth &&
            dist(this.x, this.y, base.x, base.y) <= this.healRange) {

            base.health = min(base.health + this.healRate, base.maxHealth);
            this.beamX = base.x;
            this.beamY = base.y;
            this.target = null;

            return;
        }

        // priority 3: nearest damaged combat tower in range
        if (this.target !== null) {
            var stillValid = false;

            for (var i = 0; i < towers.length; i++) {
                if (towers[i] == this.target) {
                    stillValid = true;
                    break;
                }
            }

            if (!stillValid ||
                this.target.health >= this.target.maxHealth ||
                dist(this.x, this.y, this.target.x, this.target.y) <= this.healRange) {

                this.target = null;
            }

        }

        if (this.target == null) {
            for (var i = 0; i < towers.length; i++) {
                var t = towers[i];

                if (t == this || t instanceof HealingTower) continue;

                if (t.health < t.maxHealth &&
                    dist(this.x, this.y, t.x, t.y) <= this.healRange) {

                    this.target = t;
                    break;
                }
            }
        }

        if (this.target !== null) {
            
            this.target.health = min(this.target.health + this.healRate, this.target.maxHealth);

            this.beamX = this.target.x;
            this.beamY = this.target.y;
        }
    }

    draw() {
        super.draw();
        if (this.beamX === null) return;

        var tx = this.beamX;
        var ty = this.beamY;

        // glowing beam — layered strokes for a soft glow effect
        noFill();
        strokeWeight(6);
        stroke(0, 255, 80, 40);
        line(this.x, this.y, tx, ty);
        strokeWeight(3);
        stroke(0, 255, 80, 100);
        line(this.x, this.y, tx, ty);
        strokeWeight(1.5);
        stroke(180, 255, 180, 200);
        line(this.x, this.y, tx, ty);

        // animated bubbles travelling along the beam
        var bubbleCount = 4;
        var speed = 0.008;
        for (var b = 0; b < bubbleCount; b++) {
            var t = ((frameCount * speed) + b / bubbleCount) % 1;
            var bx = lerp(this.x, tx, t);
            var by = lerp(this.y, ty, t);
            var pulse = 3 + sin(frameCount * 0.3 + b * TWO_PI / bubbleCount) * 1.5;
            noStroke();
            fill(0, 255, 80, 180);
            ellipse(bx, by, pulse * 2, pulse * 2);
        }

        noStroke();
    }
}