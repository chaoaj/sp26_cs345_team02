// -------- Vars --------

var towers = []; // stores all placed towers

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

var placeableArea = {
    size: 2048,
    x: -1024,
    y: -1024
};

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
 * @returns false if (x, y) overlap an existing tower
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

    lastTowerPlacedFrame = frameCount;

    playerStats.money -= tower.price;
}

/**
 * Draws towers on the screen.
 * @returns N/A
 */
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

                towers[j].health -= 0.4;
                enemies[i].health -= (towers[j].wallDamage || 1);

                if (towers[j].health <= 0) {
                    towers.splice(j, 1);
                    break;
                }

                if (enemies[i].health <= 0) {

                    if (enemies[i].engagedTroop !== null) {
                        enemies[i].engagedTroop.engagedEnemy = null;
                    }

                    killedEnemies.push({
                        x: enemies[i].x,
                        y: enemies[i].y,
                        frame: frameCount
                    });

                    enemies.splice(i, 1);

                    playerStats.money += enemyStats.moneyDropped;
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

}
