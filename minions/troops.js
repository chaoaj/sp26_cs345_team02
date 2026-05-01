/**
 * Troops spawned by AttackTower. Troops chase enemies within a given range,
 * then locks onto that enemy. Both the enemies and troops fight each other and take damage.
 */
class Troop {
    constructor(x, y, tower) {
        this.x = x;
        this.y = y;

        this.towerX = x;
        this.towerY = y;
        this.tower = tower;

        this.leashRange = 400;

        this.size = 20;
        this.speed = 3.5;

        // troops inherit their power level from the tower that spawned them
        // upgrading the AttackTower's "Troop Power" raises tower.troopLevel
        this.level = (tower && tower.troopLevel) ? tower.troopLevel : 1;

        this.health = 60 * this.level;
        this.maxHealth = this.health;

        this.attackRate = 1.0 * this.level; // damage dealt per frame during combat

        this.engagedEnemy = null;
        this.inCombat = false;
        this.isDead = false;
    }

    update() {
        if (this.isDead) return;

        //  ----- attackers stuff ------
        var attackers = [];

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].engagedTroop === this) {
                attackers.push(enemies[i]);
            }
        }

        this.inCombat = this.engagedEnemy !== null || attackers.length > 0;

        // ----- troop combat -----
        if (this.inCombat) {

            // guard stale reference (e.g. enemy killed mid-combat by an explosive)
            if (this.engagedEnemy !== null) {
                var foundEnemy = false;

                for (var i = 0; i < enemies.length; i++) {
                    if (enemies[i] == this.engagedEnemy) {
                        foundEnemy = true;
                        break;
                    }
                }

                if (!foundEnemy) {
                    this.engagedEnemy == null;
                }
            }

            // if we're being attacked but have no target, fight back against an attacker
            if (this.engagedEnemy === null && attackers.length > 0) {
                this.engagedEnemy = attackers[0];
            }

            // deal damage to our target
            if (this.engagedEnemy !== null) {
                this.engagedEnemy.health -= this.attackRate;

                if (this.engagedEnemy.health <= 0) {
                    for (var i = 0; i < enemies.length; i++) {
                        if (enemies[i] == this.engagedEnemy) {
                            enemies.splice(i, 1);
                            playerStats.money += enemyStats.moneyDropped;
                            break;
                        }
                    }

                    this.engagedEnemy = null;
                }
            }

            // ----- damage -----
            // take stacked damage with diminishing returns:
            // first attacker deals full rate, each additional deals 50%
            for (var i = 0; i < attackers.length; i++) {
                if (enemies.includes(attackers[i])) {
                    this.health -= attackers[i].attackRate * (i === 0 ? 1.0 : 0.5);
                }
            }

            // ----- troop death -----
            if (this.health <= 0) {
                // free every enemy that was locked onto this troop
                for (var i = 0; i < enemies.length; i++) {

                    if (enemies[i].engagedTroop === this) {
                        enemies[i].engagedTroop = null;
                    }
                }

                this.isDead = true;
            }

            return;
        }

        // ----- troop chase -----
        var nearest = null;
        var closest = Infinity;

        for (var i = 0; i < enemies.length; i++) {

            var distanceToTower = dist(enemies[i].x, enemies[i].y, this.towerX, this.towerY)

            if (distanceToTower > this.leashRange) continue;

            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);

            if (d < closest) {
                closest = d;
                nearest = enemies[i];
            }
        }

        if (nearest !== null) {

            var angle = atan2(nearest.y - this.y, nearest.x - this.x);

            this.x += cos(angle) * this.speed;
            this.y += sin(angle) * this.speed;

            // engage on contact
            if (dist(this.x, this.y, nearest.x, nearest.y) < this.size / 2 + nearest.size / 2) {
                this.engagedEnemy = nearest;
                nearest.engagedTroop = this;
            }

        } else {

            // if no enemies in range, troops return to tower
            var d = dist(this.x, this.y, this.towerX, this.towerY);

            if (d > this.speed) {

                var angle = atan2(this.towerY - this.y, this.towerX - this.x);
                
                this.x += cos(angle) * this.speed;
                this.y += sin(angle) * this.speed;
            }
        }

        // ----- pushing apart while chasing -----

        for (var i = 0; i < troops.length; i++) {

            if (troops[i] == this || troops[i].isDead) continue;

            var d = dist(this.x, this.y, troops[i].x, troops[i].y)
            var minDist =  this.size;

            if (d < minDist && d > 0) {

                var angle = atan2(this.y - troops[i].y, this.x - troops[i].x);
                var push = (minDist - d) / minDist;

                this.x += cos(angle) * push * 2;
                this.y += sin(angle) * push * 2;
            }
        }
    }

    draw() {
        if (this.isDead) return;
        
        var ox = this.inCombat ? random(-2, 2) : 0;
        var oy = this.inCombat ? random(-2, 2) : 0;
        fill(0, 100, 255);
        noStroke();
        ellipse(this.x + ox, this.y + oy, this.size, this.size);
        drawHealthBar(this.x, this.y, this.size, this.health, this.maxHealth);
    }

    isDone() {
        return this.isDead;
    }
}
