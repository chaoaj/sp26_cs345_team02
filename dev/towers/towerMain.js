// -------- Vars --------

var towers = []; // stores all placed towers

// keeps track of which tower is hovered
var hovered = null;

// stores all projectiles and minions
var explosives = [];
var arrows = [];
var troops = [];

// maps type string -> constructor
var towerTypes = {
    normal:  NormalTower,
    attack:  AttackTower,
    healing: HealingTower,
    explosive:  ExplosiveTower
};

// Per-type upgrade state. All towers of a given class share these stats,
// upgrading one upgrades the entire type. <<<<<
//
//   level         current upgrade level (1..maxLevel)
//   maxLevel      hard cap: once reached, upgrade() is a no-op
//   costBase      cost of the FIRST upgrade (level 1 -> 2)
//   costMult      cost grows by this factor each level (1.6 -> ~4x by max)
//   currentStats  live stat values, mutated on upgrade and copied to new instances
//   schedule      ordered list of {stat, delta, label} entries; index = level - 1
//
// Working on a doc for the math, don't touch the numbers for now.
var towerUpgrades = {
    NormalTower: {
        level: 1,
        maxLevel: 5,
        costBase: 35,
        costMult: 1.6,
        currentStats: { damage: 20, attackRange: 350 },
        schedule: [
            { stat: "damage",      delta: 10, label: "Arrow Damage" },
            { stat: "attackRange", delta: 50, label: "Attack Range" },
            { stat: "damage",      delta: 10, label: "Arrow Damage" },
            { stat: "attackRange", delta: 50, label: "Attack Range" }
        ]
    },
    ExplosiveTower: {
        level: 1,
        maxLevel: 5,
        costBase: 150,
        costMult: 1.6,
        currentStats: { damage: 80, explosionRadius: 150 },
        schedule: [
            { stat: "damage",          delta: 20, label: "Blast Damage" },
            { stat: "explosionRadius", delta: 30, label: "Blast Radius" },
            { stat: "damage",          delta: 20, label: "Blast Damage" },
            { stat: "explosionRadius", delta: 30, label: "Blast Radius" }
        ]
    },
    AttackTower: {
        level: 1,
        maxLevel: 5,
        costBase: 125,
        costMult: 1.6,
        currentStats: { troopCap: 3, troopLevel: 1 },
        schedule: [
            { stat: "troopCap",   delta: 1, label: "Troop Cap" },
            { stat: "troopLevel", delta: 1, label: "Troop Power" },
            { stat: "troopCap",   delta: 1, label: "Troop Cap" },
            { stat: "troopLevel", delta: 1, label: "Troop Power" }
        ]
    },
    HealingTower: {
        level: 1,
        maxLevel: 6,
        costBase: 75,
        costMult: 1.8,
        currentStats: { healRange: 200, maxHealth: 100, auraHealRate: 0 },
        schedule: [
            { stat: "healRange",    delta: 30,   label: "Heal Range" },
            { stat: "maxHealth",    delta: 25,   label: "Tower HP" },
            { stat: "auraHealRate", delta: 0.02, label: "Aura Heal" },
            { stat: "auraHealRate", delta: 0.02, label: "Aura Heal" },
            { stat: "healRange",    delta: 40,   label: "Mass Heal" }
        ]
    }
};

// Reverts every tower type back to level 1 with baseline stats by undoing
// each applied schedule entry. Called from resetGame() so a new run starts fresh.
function resetTowerUpgrades() {
    for (var key in towerUpgrades) {
        var cfg = towerUpgrades[key];
        for (var i = 0; i < cfg.level - 1; i++) {
            var entry = cfg.schedule[i];
            cfg.currentStats[entry.stat] -= entry.delta;
        }
        cfg.level = 1;
    }
}

// controls how long the cool down for placing a tower should be
var towerPlaceCoolDownFrames = 50;       // Set to 0 for testing.

// stores the frame last tower was placed on
var lastTowerPlacedFrame;

// images loaded in preload(); assigned to subclasses there
var towerImages = {};

// currently selected tower type — change with keys 1-4
var activeTowerType = "normal";

// max health values for each entity type
var healthConfig = {
    base: 200,
    tower: 100
};

// controls how many towers can be place at once
var maxTowers = 16;

var placeableArea = {
    size: 2048,
    x: -1024,
    y: -1024
};

// Returns the active tower-count cap. Base of 16, +2 for each tower type that
// has reached max level. All four maxed -> cap is 24.
function effectiveMaxTowers() {
    var bonus = 0;
    for (var key in towerUpgrades) {
        var cfg = towerUpgrades[key];
        if (cfg.level >= cfg.maxLevel) bonus += 2;
    }
    return maxTowers + bonus;
}

/**
 * Controls tower placing cool down animation
 */
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

/**
 * returns false if (x, y) would overlap an existing tower or the main base
 * @param {*} tower
 * @returns false if (x, y) overlap an existing tower, a tower has been placed too recently, the
 * player does not have enough money, or too many towers are currently placed.
 */
function canPlaceTower(tower) {
    // returns false if a tower was placed within towerPlaceCoolDownFrames frames
    if (frameCount - lastTowerPlacedFrame < towerPlaceCoolDownFrames) {
        return false;
    }

    // returns false if the player has less money than the tower costs
    if (playerStats.money < tower.price) {
        return false;
    }

    if (towers.length >= effectiveMaxTowers()) {
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

/**
 * Places a tower of activeTowerType at (x, y). Denies if pos is blocked by collision.
 * @param {*} x
 * @param {*} y
 * @returns
 */
function placeTower(x, y) {

    var TowerClass = towerTypes[activeTowerType];

    if (TowerClass == undefined) {
        TowerClass = NormalTower;
    }

    var tower = new TowerClass(x, y);

    if (!canPlaceTower(tower)) return;

    towers.push(tower);
    onTowerPlaced();

    let placementSound = new Audio(towerPlacementSound.src);

    placementSound.volume = 0.2;
    placementSound.play();

    lastTowerPlacedFrame = frameCount;

    playerStats.money -= tower.price;
}

/**
 * Draw a preview of the selected tower type at the players current position.
 * @returns N/A
 */
function drawTowerPreview() {
    if (!previewTower) return;
    var img;
    if (activeTowerType == "normal") {
        img = towerImages.normal;
    } else if (activeTowerType == "healing") {
        img = towerImages.healing;
    } else if (activeTowerType == "attack") {
        img = towerImages.attack;
    } else if (activeTowerType == "explosive") {
        img = towerImages.explosive;
    }
    var transparentImg = createImage(100, 100);
    transparentImg.copy(img, 0, 0, 100, 100, 0, 0, 100, 100);
    transparentImg.loadPixels();
    for (var i = 3; i < transparentImg.pixels.length; i += 4) {
        if (transparentImg.pixels[i] != 0) {
            transparentImg.pixels[i] = 160;
        }
        if (canPlaceTower(new Tower(playerStats.x, playerStats.y))) {
            transparentImg.pixels[i - 2] += 100;
        } else {
            transparentImg.pixels[i - 3] += 100;
        }
    }
    transparentImg.updatePixels();
    image(transparentImg, playerStats.x, playerStats.y, 130, 130);
}

/**
 * Draws towers on the screen.
 * @returns N/A
 */
function drawTowers() {
    var worldMouseX;
    var worldMouseY;

    if (lastInput.type == "CONTROLLER") {
        // treat as if the mouse were always position at the player.
        noCursor();
        worldMouseX = playerStats.x;
        worldMouseY = playerStats.y;
    } else {
        // convert screen mouse to world coordinates
        cursor(ARROW);
        worldMouseX = mouseX - width / 2 + camera.x;
        worldMouseY = mouseY - height / 2 + camera.y;
    }

    // find hovered tower
    hovered = null;
    var min = 9999;
    for (var i = 0; i < towers.length; i++) {
        var d = dist(worldMouseX, worldMouseY, towers[i].x, towers[i].y);
        if (d < towers[i].size / 2 && d < min) {
            hovered = towers[i];
            min = d;
        }
    }

    // draw each tower
    for (var i = 0; i < towers.length; i++) {
        towers[i].draw();
    }

    if (hovered === null) return;

    // draw range radius
    var range = hovered.leashRange ||
                hovered.attackRange ||
                hovered.healRange ||
                null;

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

/**
 * Checks each enemy against each tower. Both take per frame damage on contact.
 */
function checkTowerCollisions() {

    for (var i = enemies.length - 1; i >= 0; i--) {

        for (var j = towers.length - 1; j >= 0; j--) {

            var d = dist(enemies[i].x, enemies[i].y, towers[j].x, towers[j].y);

            var collisionDist = enemies[i].size / 2 + towers[j].size / 2;

            if (d < collisionDist) {

                if (frameCount - enemies[i].lastAttackFrame > 30) {
                    towers[j].health -= damageConfig.enemyToTower;
                    enemies[i].lastAttackFrame = frameCount;
                }

                enemies[i].health -= (towers[j].wallDamage || 1);

                if (towers[j].health <= 0) {
                    towers.splice(j, 1);
                    break;
                }

                if (enemies[i].health <= 0) {

                    if (enemies[i].engagedTroop !== null) {
                        enemies[i].engagedTroop.engagedEnemy = null;
                    }
                    enemyKilled(i, towers[j]);
                }
                break;
            }
        }
    }
}

/**
 * This functions allows the player to sell towers if the players mouse
 * hovers over a tower. It gives half of the money used to place the tower.
 */
function sellTower() {
    if (hovered === null) {
        return;
    }
    var soldTower = hovered;

    var refund = soldTower.price / 2;
    playerStats.money += refund;

    // this whole block is just a special case to delete troopers if the attack tower is sold
    if (soldTower instanceof AttackTower) {
        for (var i = troops.length - 1; i >= 0; i--) {
            if (troops[i].tower == soldTower) {
                for (var j = 0; j < enemies.length; j++) {
                    if (enemies[j].engagedTroop == troops[i]) {
                        enemies[j].engagedTroop = null;
                    }
                }
                troops.splice(i, 1);
            }
        }
    }
    towers.splice(towers.indexOf(soldTower), 1);
    return;
}

/**
 * Upgrades the hovered tower, increasing a stat unique to its type.
 * Costs upgradePrice from playerStats.money; no-op if the player can't afford it.
 */
function upgradeTower() {
    if (hovered === null) return;
    if (typeof hovered.upgrade !== "function") return;
    var up = hovered.upgrade();

    if (!up) return;

    let asdf = new Audio(towerUpgradeSound.src);
    asdf.volume = 0.2;

    asdf.play();

}

// Rounds floats to 2 decimals for display; leaves integers alone.
function formatStat(v) {
    if (typeof v !== "number") return v;
    if (Number.isInteger(v)) return v;
    return Math.round(v * 100) / 100;
}

/**
 * Draws a stats panel above the hovered tower showing type, HP, level,
 * the upgradeable stat preview, and the upgrade cost. Flips below the
 * tower if the panel would clip the top of the camera view.
 */
function drawTowerHoverPanel() {
    if (hovered === null) return;

    var info = hovered.getUpgradeInfo();
    var name = hovered.constructor.name.replace(/Tower$/, "") + " Tower";
    var upgradeable = info.maxLevel > 1;

    var panelW = 240;
    var panelH = upgradeable ? 110 : 60;
    var px = hovered.x - panelW / 2;
    var py = hovered.y - hovered.size / 2 - panelH - 10;

    // flip below the tower if the panel would clip the top of the camera view
    if (py < camera.y - height / 2 + 10) {
        py = hovered.y + hovered.size / 2 + 10;
    }

    push();
    rectMode(CORNER);
    noStroke();
    fill(0, 180);
    rect(px, py, panelW, panelH, 6);

    fill(255);
    textAlign(LEFT, TOP);
    textSize(14);
    text(name, px + 10, py + 8);
    text("HP: " + Math.ceil(hovered.health) + " / " + hovered.maxHealth, px + 10, py + 28);

    if (upgradeable) {
        text("Lv " + info.level + " / " + info.maxLevel, px + 10, py + 48);
        if (info.maxed) {
            fill(255, 215, 0);
            text("MAXED", px + 10, py + 68);
        } else {
            text(info.statLabel + ": " + formatStat(info.current) + " -> " + formatStat(info.next),
                 px + 10, py + 68);
            if (info.canAfford) {
                fill(120, 255, 120);
            } else {
                fill(255, 120, 120);
            }
            text("Press U  (" + info.cost + "g)", px + 10, py + 88);
        }
    }
    pop();
    noStroke();
}
