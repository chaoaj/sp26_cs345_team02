
class HealingTower extends Tower {
    constructor(x, y) {
        super(x, y);

        this.img = towerImages.healing;
        this.price = 100;

        var cs = towerUpgrades.HealingTower.currentStats;
        this.healRange = cs.healRange;
        this.maxHealth = cs.maxHealth;
        this.health = cs.maxHealth;
        // healRate (the targeted beam) is fixed; only the aura scales with upgrades
        this.healRate = 0.1;
        this.auraHealRate = cs.auraHealRate;

        this.target = null;

        this.beamTargets = [];

        this.lastHealSoundFrame = 0;
        this.healSound = new Audio(towerHealingSound.src);
        this.healSound.loop = true;
        this.healSound.volume = 0.8;
    }

    isMassHeal() {
        return towerUpgrades.HealingTower.level >= towerUpgrades.HealingTower.maxLevel;
    }

    stopHealingSound() {
        this.healSound.pause();
        this.healSound.currentTime = 0;
    }

    updateHealingSound(healing) {
        if (healing) {
            if (this.healSound.paused) {
                this.healSound.currentTime = 0;
                this.healSound.play();
            }
        } else {
            this.stopHealingSound();
        }
    }

    update() {
        if (currentScreen !== "game" || paused) {
            this.updateHealingSound(false);
            return;
        }

        this.beamTargets = [];
        var healing = false;

        // priority 1: player
        if (playerStats.health < playerStats.maxHealth &&
            dist(this.x, this.y, playerStats.x, playerStats.y) <= this.healRange) {

            playerStats.health = min(playerStats.health + this.healRate, playerStats.maxHealth);
            healing = true;
            this.beamTargets.push({ x: playerStats.x, y: playerStats.y });

            if (!this.isMassHeal()) {
                this.target = null;
                this.updateHealingSound(healing);
                return;
            }
        }

        // priority 2: main base
        if (base.health < base.maxHealth &&
            dist(this.x, this.y, base.x, base.y) <= this.healRange) {

            base.health = min(base.health + this.healRate, base.maxHealth);
            healing = true;
            this.beamTargets.push({ x: base.x, y: base.y });

            if (!this.isMassHeal()) {
                this.target = null;
                this.updateHealingSound(healing);
                return;
            }
        }

        if (this.isMassHeal()) {
            // mass heal: beam to ALL damaged towers in range
            for (var i = 0; i < towers.length; i++) {
                var t = towers[i];
                if (t === this) continue;
                if (t.health < t.maxHealth &&
                    dist(this.x, this.y, t.x, t.y) <= this.healRange) {
                    t.health = min(t.health + this.healRate, t.maxHealth);
                    healing = true;
                    this.beamTargets.push({ x: t.x, y: t.y });
                }
            }
        } else {
            // single-target beam: nearest damaged combat tower in range
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
                    dist(this.x, this.y, this.target.x, this.target.y) > this.healRange) {

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

                healing = true;

                this.beamTargets.push({ x: this.target.x, y: this.target.y });
            }
        }

        // passive aura — small heal to ALL towers in range when upgraded past Lv2
        if (this.auraHealRate > 0) {
            for (var i = 0; i < towers.length; i++) {
                var t = towers[i];
                if (t === this) continue;
                if (t.health < t.maxHealth &&
                    dist(this.x, this.y, t.x, t.y) <= this.healRange) {
                    t.health = min(t.health + this.auraHealRate, t.maxHealth);
                    healing = true;
                }
            }
        }

        this.updateHealingSound(healing);
    }

    draw() {
        super.draw();
        if (this.beamTargets.length === 0) return;

        for (var b = 0; b < this.beamTargets.length; b++) {
            var tx = this.beamTargets[b].x;
            var ty = this.beamTargets[b].y;

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
            for (var i = 0; i < bubbleCount; i++) {
                var t = ((frameCount * speed) + i / bubbleCount + b * 0.13) % 1;
                var bx = lerp(this.x, tx, t);
                var by = lerp(this.y, ty, t);
                var pulse = 3 + sin(frameCount * 0.3 + i * TWO_PI / bubbleCount) * 1.5;
                noStroke();
                fill(0, 255, 80, 180);
                ellipse(bx, by, pulse * 2, pulse * 2);
            }
        }

        noStroke();
    }
}