// stores all placed towers
var towers = [];

// images loaded in preload(); assigned to subclasses there
var towerImages = {};

// currently selected tower type — change with keys 1-4
var activeTowerType = "normal";

// max health values for each entity type
var healthConfig = {
    base: 200,
    tower: 100
};

// damage dealt per enemy contact — edit these to tune difficulty
var damageConfig = {
    enemyToTower: 25,  // flat hit; enemy is removed on contact
    enemyToBase: 10    // flat hit; enemy is removed on contact
};

// --- Base Tower class ---
class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.health = healthConfig.tower;
        this.maxHealth = healthConfig.tower;
        this.img = null;  // subclasses assign this after images are loaded
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
    }
}

class AttackTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.attack;
    }
}

class HealingTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.healing;
    }
}

class DamageTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.damage;
    }
}

// maps type string -> constructor; add new tower types here
var towerTypes = {
    normal:  NormalTower,
    attack:  AttackTower,
    healing: HealingTower,
    damage:  DamageTower
};

// returns false if (x, y) would overlap an existing tower or the main base
function canPlaceTower(x, y) {
    var halfSize = 30 / 2;

    // check against the main base
    if (dist(x, y, base.x, base.y) < halfSize + base.size / 2) {
        return false;
    }

    // check against every existing tower
    for (var i = 0; i < towers.length; i++) {
        if (dist(x, y, towers[i].x, towers[i].y) < halfSize + towers[i].size / 2) {
            return false;
        }
    }

    return true;
}

// places a tower of activeTowerType at (x, y) — rejected if position is blocked
function placeTower(x, y) {
    if (!canPlaceTower(x, y)) return;

    var TowerClass = towerTypes[activeTowerType] || NormalTower;
    towers.push(new TowerClass(x, y));
}

function drawTowers() {
    for (var i = 0; i < towers.length; i++) {
        towers[i].draw();
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

                if (towers[j].health <= 0) {
                    towers.splice(j, 1);
                }

                enemies.splice(i, 1);
                break;
            }
        }
    }
}
