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
// controls how long the cool down for placing a tower should be
var towerPlaceCoolDownFrames = 50;

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
    }
}

class ExplosiveTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.img = towerImages.explosive;
        this.price = 250;
    }
}

// --------- Vars ---------

// maps type string -> constructor; add new tower types here
var towerTypes = {
    normal:  NormalTower,
    attack:  AttackTower,
    healing: HealingTower,
    explosive:  ExplosiveTower
};

// controls tower placing cool down animation
function towerPlaceCoolDownAnimation() {
    if (frameCount - lastTowerPlacedFrame < towerPlaceCoolDownFrames) {
        angleMode(RADIANS);
        noFill();
        stroke(0);
        strokeWeight(6);
        arc(playerStats.x, playerStats.y + 60, 15, 15, -90 * PI / 180, 270 * PI / 180 -
        ((frameCount - lastTowerPlacedFrame) % towerPlaceCoolDownFrames) * (TWO_PI / towerPlaceCoolDownFrames));
        stroke(255, 84, 84);
        strokeWeight(4);
        arc(playerStats.x, playerStats.y + 60, 15, 15, -90 * PI / 180, 270 * PI / 180 -
        ((frameCount - lastTowerPlacedFrame) % towerPlaceCoolDownFrames) * (TWO_PI / towerPlaceCoolDownFrames));
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
