// stores all placed towers
var towers = [];

// images loaded in preload(); assigned to subclasses there
var towerImages = {};

// currently selected tower type — change with keys 1-4
var activeTowerType = "normal";

// max health values for each entity type
var healthConfig = {
    base: 200,                          // Set to large value temporarily for testing.
    tower: 100                          // Set to large value temporarily for testing.
};
// controls how long the cool down for placing a tower should be
var towerPlaceCoolDownFrames = 50;       // Set to 0 for testing.

// stores the frame last tower was placed on
var lastTowerPlacedFrame;

var placeableArea = {
    size: 800,
    x: 0,
    y: 0
};

// --- Base Tower class ---
class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 130;
        this.health = healthConfig.tower;
        this.maxHealth = healthConfig.tower;
        this.img = null;  // subclasses assign this after images are loaded
        this.price = null;
    }

    draw() {
        if (this.img) {
            imageMode(CENTER);
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

// Tower Subclasses
class NormalTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.normal;
        this.price = 50;
    }
}

class AttackTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.attack;
        this.price = 200;
    }
}

class HealingTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.healing;
        this.price = 100;
        this.healRange = 200;
        this.healRate = 0.3;  // HP should be restored at each second of frame
        this.target = null;
    }

    update() {
        // gets target if it's destroyed, full, or out of range
        if (this.target !== null) {
            var stillValid = towers.includes(this.target) &&
                             this.target.health < this.target.maxHealth &&
                             dist(this.x, this.y, this.target.x, this.target.y) <= this.healRange;
            if (!stillValid) this.target = null;
        }

        // This will find the next in range damaged tower
        if (this.target === null) {
            for (var i = 0; i < towers.length; i++) {
                var t = towers[i];
                if (t === this) continue;
                if (t.health < t.maxHealth && dist(this.x, this.y, t.x, t.y) <= this.healRange) {
                    this.target = t;
                    break;
                }
            }
        }

        if (this.target !== null) {
            this.target.health = min(this.target.health + this.healRate, this.target.maxHealth);
        }
        this.price = 100;
    }
}

class ExplosiveTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.explosive;
        this.price = 250;
        // how far away an enemy can be before this tower targets it
        this.attackRange = 300;
        // minimum frames between shots — prevents firing every frame
        this.attackCooldown = 120; // frames (2s at 60fps)
        // initialized far in the past so the tower can fire immediately on placement
        this.lastShotFrame = -999;
        // radius of the explosion when the projectile lands
        this.explosionRadius = 150;
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
            explosives.push(new Explosive(this.x, this.y, closest.x, closest.y, this.explosionRadius));
            this.lastShotFrame = frameCount;
        }
    }
}

// Projectile fired by ExplosiveTower. Travels to a fixed target position, then
// deals AOE damage to all enemies within explosionRadius on arrival.
class Explosive {
    constructor(x, y, targetX, targetY, explosionRadius) {
        this.x = x;
        this.y = y;
        // position locked at fire time — does not track the enemy after launch
        this.targetX = targetX;
        this.targetY = targetY;
        this.explosionRadius = explosionRadius;
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
        this.exploded = true;
        this.explosionFrame = frameCount;
        // iterate backwards so splicing doesn't skip enemies
        for (var i = enemies.length - 1; i >= 0; i--) {
            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);
            if (d <= this.explosionRadius) {
                killedEnemies.push({ x: enemies[i].x, y: enemies[i].y, frame: frameCount });
                enemies.splice(i, 1);
                playerStats.money += enemyStats.moneyDropped;
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
        return this.exploded && (frameCount - this.explosionFrame >= this.explosionDuration);
    }
}

// stores all in-flight explosives and active explosion effects
var explosives = [];

// --------- Vars ---------

// maps type string -> constructor; add new tower types here
var towerTypes = {
    normal:  NormalTower,
    attack:  AttackTower,
    healing: HealingTower,
    explosive:  ExplosiveTower
};

// controls tower placing cool down animation
function drawTowerPlaceCoolDownAnimation() {
    if (towerPlaceCoolDownFrames > 0 && frameCount - lastTowerPlacedFrame < towerPlaceCoolDownFrames) {
        var progress = (frameCount - lastTowerPlacedFrame) * (TWO_PI / towerPlaceCoolDownFrames)
        angleMode(RADIANS);
        noFill();
        stroke(0);
        strokeWeight(6);
        arc(playerStats.x, playerStats.y + 60, 15, 15, -HALF_PI, TWO_PI - HALF_PI - progress);
        stroke(255, 84, 84);
        strokeWeight(4);
        arc(playerStats.x, playerStats.y + 60, 15, 15, -HALF_PI, TWO_PI - HALF_PI - progress);
        noStroke();
    }
}

// returns false if (x, y) would overlap an existing tower or the main base
function canPlaceTower(tower) {
    // returns false if a tower was placed within towerPlaceCoolDownFrames frames
    if (frameCount - lastTowerPlacedFrame < towerPlaceCoolDownFrames) {
        return false;
    }

    // returns false if the player has less money than the tower costs
    if (playerStats.money < tower.price) {
        return false;
    }

    var halfSize = 60 / 2;

    if (tower.x - halfSize < placeableArea.x ||
        tower.x + halfSize> placeableArea.x + placeableArea.size ||
        tower.y - halfSize< placeableArea.y ||
        tower.y + halfSize > placeableArea.y + placeableArea.size)
        {
            return false;
        }

    // check against the main base
    if (dist(tower.x, tower.y, base.x, base.y) < halfSize + base.size / 2) {
        return false;
    }

    // check against every existing tower
    for (var i = 0; i < towers.length; i++) {
        if (dist(tower.x, tower.y, towers[i].x, towers[i].y) < halfSize + towers[i].size / 2) {
            return false;
        }
    }
    return true;
}

// places a tower of activeTowerType at (x, y) — rejected if position is blocked
function placeTower(x, y) {
    var TowerClass = towerTypes[activeTowerType] || NormalTower;
    var tower = new TowerClass(x, y);
    if (!canPlaceTower(tower)) return;
    towers.push(tower);
    lastTowerPlacedFrame = frameCount;
    playerStats.money -= tower.price;
}

function drawTowers() {
    for (var i = 0; i < towers.length; i++) {
        towers[i].draw();
    }
}

function updateTowers() {
    for (var i = 0; i < towers.length; i++) {
        if (towers[i].update) towers[i].update();
    }
}

function updateExplosives() {
    for (var i = explosives.length - 1; i >= 0; i--) {
        explosives[i].update();
        if (explosives[i].isDone()) explosives.splice(i, 1);
    }
}

function drawExplosives() {
    for (var i = 0; i < explosives.length; i++) {
        explosives[i].draw();
    }
}

// checks each enemy against each tower; flat hit damage set in damageConfig.enemyToTower
function checkTowerCollisions() {
    for (var i = enemies.length - 1; i >= 0; i--) {
        for (var j = towers.length - 1; j >= 0; j--) {
            var d = dist(enemies[i].x, enemies[i].y, towers[j].x, towers[j].y);
            var collisionDist = enemies[i].size / 2 + towers[j].size / 2;

            if (d < collisionDist) {
                towers[j].health -= damageConfig.enemyToTower;
                enemyKilled(i, j);
                if (towers[j].health <= 0) {
                    towers.splice(j, 1);
                }
                break;
            }
        }
    }
}
