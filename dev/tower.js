// stores all placed towers
var towers = [];

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


var towerStats = {
    size: 30,
    maxHealth: healthConfig.tower
};

// shared health bar renderer used by towers and the base
function drawHealthBar(x, y, barWidth, health, maxHealth) {
    var ratio = max(0, health / maxHealth);
    var barH = 5;
    var barY = y - barWidth / 2 - 8;

    noStroke();
    fill(200, 0, 0);
    rectMode(CORNER);
    rect(x - barWidth / 2, barY, barWidth, barH);

    fill(0, 200, 0);
    rect(x - barWidth / 2, barY, barWidth * ratio, barH);
}

// places a tower at the given x, y position
function placeTower(x, y) {
    var tower = {};
    tower.x = x;
    tower.y = y;
    tower.size = towerStats.size;
    tower.health = towerStats.maxHealth;
    towers.push(tower);
}

function drawTowers() {
    for (var i = 0; i < towers.length; i++) {
        var healthRatio = max(0, towers[i].health / towerStats.maxHealth);

        // tower body: shifts from blue (full health) to red (low health)
        fill(255 * (1 - healthRatio), 100, 255 * healthRatio);
        stroke(0);
        strokeWeight(2);
        rectMode(CENTER);
        rect(towers[i].x, towers[i].y, towers[i].size, towers[i].size);

        drawHealthBar(towers[i].x, towers[i].y, towers[i].size, towers[i].health, towerStats.maxHealth);
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
