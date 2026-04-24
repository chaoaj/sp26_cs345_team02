// stores all placed towers
var towers = [];

// images loaded in preload(); assigned to subclasses there
var towerImages = {};

// currently selected tower type — change with keys 1-4
var activeTowerType = "normal";

// max health values for each entity type
var healthConfig = {
    base: 200,                          // Set to large value temporarily for testing.
    tower: 100                               // Set to large value temporarily for testing.
};
// controls how long the cool down for placing a tower should be
var towerPlaceCoolDownFrames = 50;       // Set to 0 for testing.

// stores the frame last tower was placed on
var lastTowerPlacedFrame;


var placeableArea = {
    size: 2048,
    x: -1024,
    y: -1024
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
        this.attackRange = 350;
        this.attackCooldown = 60; // frames (1 shot/sec)
        this.lastShotFrame = -999;
    }

    update() {
        if (frameCount - this.lastShotFrame < this.attackCooldown) return;

        var closest = null;
        var closestDist = Infinity;
        for (var i = 0; i < enemies.length; i++) {
            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);
            if (d <= this.attackRange && d < closestDist) {
                closestDist = d;
                closest = enemies[i];
            }
        }

        if (closest !== null) {
            arrows.push(new Arrow(this.x, this.y, closest.x, closest.y));
            this.lastShotFrame = frameCount;
        }
    }
}

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
            if (dist(this.x, this.y, enemies[i].x, enemies[i].y) < this.size / 2 + enemies[i].size / 2) {
                enemies[i].health -= this.damage;
                if (enemies[i].health <= 0) {
                    if (enemies[i].engagedTroop !== null) enemies[i].engagedTroop.engagedEnemy = null;
                    killedEnemies.push({ x: enemies[i].x, y: enemies[i].y, frame: frameCount, ox: random(-20, 20), oy: random(-20, 20) });
                    enemies.splice(i, 1);
                    playerStats.money += enemyStats.moneyDropped;
                }
                this.done = true;
                return;
            }
        }

        // despawn if outside the world bounds
        if (this.x < -WORLD_SIZE / 2 - 50 || this.x > WORLD_SIZE / 2 + 50 ||
            this.y < -WORLD_SIZE / 2 - 50 || this.y > WORLD_SIZE / 2 + 50) {
            this.done = true;
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

class AttackTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.attack;
        this.price = 200;
        this.health = 175;
        this.maxHealth = 175;
        this.spawnCooldown = 300; // frames (5s at 60fps)
        this.lastSpawnFrame = -999;
        this.leashRange = 400;
        this.troopCap = 3;
        this.wallDamage = 2; // damage dealt per frame to enemies touching this tower
    }

    update() {
        if (frameCount - this.lastSpawnFrame < this.spawnCooldown) return;
        if (enemies.length === 0) return;

        var activeTroops = 0;
        for (var i = 0; i < troops.length; i++) {
            if (troops[i].tower === this && !troops[i].isDead) activeTroops++;
        }
        if (activeTroops >= this.troopCap) return;

        troops.push(new Troop(this.x, this.y, this));
        this.lastSpawnFrame = frameCount;
    }
}

// Troop spawned by AttackTower. Chases enemies within leash range, then locks into
// melee combat. Both sides drain each other's health at their attackRate each frame
// the higher-level combatant wins faster and survives with remaining HP.
class Troop {
    constructor(x, y, tower) {
        this.x = x;
        this.y = y;
        this.towerX = x; // leash anchor — troop returns here when no enemies are in range
        this.towerY = y;
        this.tower = tower; // reference to spawning tower for hover highlighting
        this.leashRange = 400;
        this.size = 20;
        this.speed = 3.5;
        this.level = 1;
        this.health = 60 * this.level;
        this.maxHealth = this.health;
        this.attackRate = 0.5 * this.level; // damage dealt per frame during combat
        this.engagedEnemy = null;
        this.inCombat = false;
        this.isDead = false;
    }

    update() {
        if (this.isDead) return;

        // collect every enemy currently attacking this troop (damage stacks per attacker)
        var attackers = [];
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].engagedTroop === this) attackers.push(enemies[i]);
        }
        this.inCombat = this.engagedEnemy !== null || attackers.length > 0;

        if (this.inCombat) {
            // guard stale reference (e.g. enemy killed mid-combat by an explosive)
            if (this.engagedEnemy !== null && !enemies.includes(this.engagedEnemy)) {
                this.engagedEnemy = null;
            }

            // if we're being attacked but have no target, fight back against an attacker
            if (this.engagedEnemy === null && attackers.length > 0) {
                for (var i = 0; i < attackers.length; i++) {
                    if (enemies.includes(attackers[i])) {
                        this.engagedEnemy = attackers[i];
                        break;
                    }
                }
            }

            // deal damage to our target
            if (this.engagedEnemy !== null) {
                this.engagedEnemy.health -= this.attackRate;

                if (this.engagedEnemy.health <= 0) {
                    var idx = enemies.indexOf(this.engagedEnemy);
                    if (idx !== -1) {
                        killedEnemies.push({ x: enemies[idx].x, y: enemies[idx].y, frame: frameCount, ox: random(-20, 20), oy: random(-20, 20) });
                        enemies.splice(idx, 1);
                        playerStats.money += enemyStats.moneyDropped;
                    }
                    this.engagedEnemy = null;
                }
            }

            // take stacked damage with diminishing returns:
            // first attacker deals full rate, each additional deals 50%
            for (var i = 0; i < attackers.length; i++) {
                if (enemies.includes(attackers[i])) {
                    this.health -= attackers[i].attackRate * (i === 0 ? 1.0 : 0.5);
                }
            }

            if (this.health <= 0) {
                // free every enemy that was locked onto this troop
                for (var i = 0; i < enemies.length; i++) {
                    if (enemies[i].engagedTroop === this) enemies[i].engagedTroop = null;
                }
                this.isDead = true;
            }

            return;
        }

        // --- chase phase: only pursue enemies within leash range of the tower ---
        // no engagedTroop skip here — multiple troops can pile onto the same enemy
        var nearest = null;
        var nearestDist = Infinity;
        for (var i = 0; i < enemies.length; i++) {
            if (dist(enemies[i].x, enemies[i].y, this.towerX, this.towerY) > this.leashRange) continue;
            var d = dist(this.x, this.y, enemies[i].x, enemies[i].y);
            if (d < nearestDist) {
                nearestDist = d;
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
            // no enemies in range — return to tower
            var distToTower = dist(this.x, this.y, this.towerX, this.towerY);
            if (distToTower > this.speed) {
                var angle = atan2(this.towerY - this.y, this.towerX - this.x);
                this.x += cos(angle) * this.speed;
                this.y += sin(angle) * this.speed;
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

class HealingTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.healing;
        this.price = 100;
        this.healRange = 200;
        this.healRate = 0.1; // ~1.2 HP/sec
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
            var stillValid = towers.includes(this.target) &&
                             this.target.health < this.target.maxHealth &&
                             dist(this.x, this.y, this.target.x, this.target.y) <= this.healRange;
            if (!stillValid) this.target = null;
        }

        if (this.target === null) {
            for (var i = 0; i < towers.length; i++) {
                var t = towers[i];
                if (t === this || t instanceof HealingTower) continue;
                if (t.health < t.maxHealth && dist(this.x, this.y, t.x, t.y) <= this.healRange) {
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
                // free any troop locked in combat so it isn't left with a stale reference
                if (enemies[i].engagedTroop !== null) enemies[i].engagedTroop.engagedEnemy = null;
                killedEnemies.push({ x: enemies[i].x, y: enemies[i].y, frame: frameCount, ox: random(-20, 20), oy: random(-20, 20) });
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

// stores all active troops spawned by AttackTowers
var troops = [];

// stores all in-flight arrows fired by NormalTowers
var arrows = [];

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

        let screenX = playerStats.x - camera.x + width / 2;
        let screenY = playerStats.y - camera.y + height / 2;

        stroke(0);
        strokeWeight(6);
        arc(screenX, screenY + 60, 15, 15, -HALF_PI, TWO_PI - HALF_PI - progress);
        stroke(255, 84, 84);
        strokeWeight(4);
        arc(screenX, screenY + 60, 15, 15, -HALF_PI, TWO_PI - HALF_PI - progress);
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
        tower.x + halfSize > placeableArea.x + placeableArea.size ||
        tower.y - halfSize < placeableArea.y ||
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
    // convert screen mouse to world coordinates
    var worldMouseX = mouseX - width / 2 + camera.x;
    var worldMouseY = mouseY - height / 2 + camera.y;

    // find hovered tower
    var hovered = null;
    for (var i = 0; i < towers.length; i++) {
        if (dist(worldMouseX, worldMouseY, towers[i].x, towers[i].y) < towers[i].size / 2) {
            hovered = towers[i];
            break;
        }
    }

    for (var i = 0; i < towers.length; i++) {
        towers[i].draw();
    }

    if (hovered === null) return;

    // draw range radius
    var range = hovered.leashRange || hovered.attackRange || hovered.healRange || null;
    if (range !== null) {
        noFill();
        stroke(255, 255, 255, 140);
        strokeWeight(2);
        ellipse(hovered.x, hovered.y, range * 2, range * 2);
        noStroke();
    }

    // highlight this tower's troops with a ring and always-visible health bar
    if (hovered instanceof AttackTower) {
        for (var k = 0; k < troops.length; k++) {
            var t = troops[k];
            if (t.isDead || t.tower !== hovered) continue;
            noFill();
            stroke(100, 200, 255);
            strokeWeight(3);
            ellipse(t.x, t.y, t.size + 10, t.size + 10);
            noStroke();
            drawHealthBar(t.x, t.y, t.size, t.health, t.maxHealth);
        }
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

function updateTroops() {
    for (var i = troops.length - 1; i >= 0; i--) {
        troops[i].update();
        if (troops[i].isDone()) troops.splice(i, 1);
    }
}

function updateArrows() {
    for (var i = arrows.length - 1; i >= 0; i--) {
        arrows[i].update();
        if (arrows[i].isDone()) arrows.splice(i, 1);
    }
}

function drawArrows() {
    for (var i = 0; i < arrows.length; i++) {
        arrows[i].draw();
    }
}

function drawTroops() {
    for (var i = 0; i < troops.length; i++) {
        troops[i].draw();
    }
}

// checks each enemy against each tower; both take per-frame damage on contact
function checkTowerCollisions() {
    for (var i = enemies.length - 1; i >= 0; i--) {
        for (var j = towers.length - 1; j >= 0; j--) {
            var d = dist(enemies[i].x, enemies[i].y, towers[j].x, towers[j].y);
            var collisionDist = enemies[i].size / 2 + towers[j].size / 2;

            if (d < collisionDist) {
                towers[j].health -= 0.4;
                enemies[i].health -= (towers[j].wallDamage || 1);

                if (towers[j].health <= 0) {
                    towers.splice(j, 1);
                    // tower removed — skip further enemy damage check this frame
                    break;
                }

                if (enemies[i].health <= 0) {
                    if (enemies[i].engagedTroop !== null) enemies[i].engagedTroop.engagedEnemy = null;
                    killedEnemies.push({ x: enemies[i].x, y: enemies[i].y, frame: frameCount, ox: random(-20, 20), oy: random(-20, 20) });
                    enemies.splice(i, 1);
                    playerStats.money += enemyStats.moneyDropped;
                }
                break;
            }
        }
    }
}
