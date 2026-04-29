// empty array that stores all the enemies that are on the screen
var enemies = [];
// stores dead enemy positions and the frame they died on
var killedEnemies = [];

// wave scaling — all rates are in enemies per second
var waveConfig = {
    waveLength: 1200,       // frames per wave (20s at 60fps)
    prepTimeStart: 300,     // inter-wave cooldown on wave 1 (10s at 60fps)
    prepTimeMin: 300,       // cooldown floor (5s at 60fps)
    prepTimeDecay: 30,      // frames shaved off per wave (0.5s)
    baseSpawnRate: 1,       // enemies/sec on wave 1
    spawnIncreasePerWave: 0.5,
    maxSpawnRate: 8
};

// damage dealt per enemy contact — edit these to tune difficulty
var damageConfig = {
    enemyToTower: 25,   // flat hit; enemy is removed on contact
    enemyToBase: 10,    // flat hit; enemy is removed on contact
    enemyToPlayer: 10   // flat hit; enemy is removed on contact
};

// just an object that holds the stats of the enemy
var enemyStats = {
    // size of the enemy (circle);
    size: 30,
    // movement speed
    speed: 2,
    // how far from the center enemies spawn on the canvas
    // bigger num = farther
    spawnRadius: 1500,
    // decides how much money is given to the player when this enemy is killed
    moneyDropped: 8,
    // decides the max money a player can receive from a killed enemy
    maxMoneyDropped: 30,
    // decides how much to increase moneyDropped by
    moneyIncrement: 3
};

var waveNum = 1;

var waveInProg = false;

// tracks the full duration of the current inter-wave cooldown for arc rendering
var currentPrepTime = waveConfig.prepTimeStart;

// countdown to the next wave
var prepTimeFrames = currentPrepTime;

// counts down until the next enemy can spawn in a current wave
var enemyTimer = 0;

// current spawn delay in frames — set each wave by beginWave()
var enemyDelay = spawnRateToDelay(waveConfig.baseSpawnRate);

// counts down the remaining frames in the current wave
var waveTimer = 0;

function updateEnemyStats() {
    if (waveNum % 10 == 0) {
        enemyStats.speed += 1;
        enemyStats.enemyToBase += 3;
    }

    if (enemyStats.moneyDropped + enemyStats.moneyIncrement > enemyStats.maxMoneyDropped) {
        enemyStats.moneyDropped = enemyStats.maxMoneyDropped;
    } else {
        enemyStats.moneyDropped += enemyStats.moneyIncrement;
    }
    enemyStats.damageToTower += 5
    enemyStats.damageToPlayer += 5

    announcement = new Announcement("Enemy stats have increased.");
    showAnnouncement = true;
}

function updateEnemies() {
    if (waveInProg == false) {
        prepTimeFrames--;

        if (prepTimeFrames <= 0) {
            beginWave();
        }
    } else {
        waveTimer--;
        enemyTimer--;

        if (enemyTimer <= 0){
            spawnEnemy();
            enemyTimer = enemyDelay;
        }

        if (waveTimer <= 0) {
            stopWave();
        }
    }

    for (var i = enemies.length - 1; i >= 0; i--) {
        // halted while locked in melee combat with a troop
        if (enemies[i].engagedTroop !== null) continue;

        // recalculate direction toward nearest tower or base each frame
        var target = getNearestTarget(enemies[i]);
        var dx = target.x - enemies[i].x;
        var dy = target.y - enemies[i].y;
        var d = dist(enemies[i].x, enemies[i].y, target.x, target.y);
        if (d > 0) {
            enemies[i].xSpeed = (dx / d) * enemyStats.speed;
            enemies[i].ySpeed = (dy / d) * enemyStats.speed;
        }

        enemies[i].x += enemies[i].xSpeed;
        enemies[i].y += enemies[i].ySpeed;

        // if the target is a troop and we've reached it, engage (multiple enemies can pile on)
        if (troops.includes(target) && !target.isDead) {
            var dToTroop = dist(enemies[i].x, enemies[i].y, target.x, target.y);
            if (dToTroop < enemies[i].size / 2 + target.size / 2) {
                enemies[i].engagedTroop = target;
            }
        }

        if (enemies[i].x < -WORLD_SIZE / 2 - 800 ||
            enemies[i].x > WORLD_SIZE / 2 + 800 ||
            enemies[i].y < -WORLD_SIZE / 2 - 800 ||
            enemies[i].y > WORLD_SIZE / 2 + 800)
            {
            enemies.splice(i, 1);
            }
    }
}

/**
 * Return the nearest tower to the enemy, or the base if no towers exist.
 * Enemies will break off and engage any troop spotted within troopDetectionRange.
 */
function getNearestTarget(enemy) {
    var nearest = base;
    var nearestDist = dist(enemy.x, enemy.y, base.x, base.y);

    for (var j = 0; j < towers.length; j++) {
        var d = dist(enemy.x, enemy.y, towers[j].x, towers[j].y);
        if (d < nearestDist) {
            nearestDist = d;
            nearest = towers[j];
        }
    }

    // engage nearby troops — enemies divert when a troop is spotted within range
    var troopDetectionRange = 300;
    for (var k = 0; k < troops.length; k++) {
        if (troops[k].isDead) continue;
        var d = dist(enemy.x, enemy.y, troops[k].x, troops[k].y);
        if (d < troopDetectionRange && d < nearestDist) {
            nearestDist = d;
            nearest = troops[k];
        }
    }

    return nearest;
}

// converts enemies-per-second to a frame delay
function spawnRateToDelay(enemiesPerSecond) {
    return round(60 / enemiesPerSecond);
}

function beginWave() {
    waveInProg = true;
    waveTimer = waveConfig.waveLength;
    enemyTimer = 0;
    var rate = min(waveConfig.maxSpawnRate,
                   waveConfig.baseSpawnRate + waveNum * waveConfig.spawnIncreasePerWave);
    enemyDelay = spawnRateToDelay(rate);
}

function stopWave() {
    waveInProg = false;
    waveNum++;
    currentPrepTime = max(waveConfig.prepTimeMin,
                          waveConfig.prepTimeStart - (waveNum - 1) * waveConfig.prepTimeDecay);
    prepTimeFrames = currentPrepTime;

    if (waveNum % 5 == 0) {
        updateEnemyStats();
    }
}

function spawnEnemy() {
    var enemy = {};

    enemy.size = enemyStats.size;
    enemy.level = Math.ceil(waveNum / 3);
    enemy.health = 60 * enemy.level;
    enemy.maxHealth = enemy.health;
    enemy.attackRate = 0.5 * enemy.level; // damage dealt per frame during combat
    enemy.engagedTroop = null;

    // this is the center of the map (or the base)
    var baseCenterX = base.x;
    var baseCenterY = base.y;

    // TWO_PI is just a circle, it selects a random angle from 360 degrees
    //angleMode(RADIANS);
    var angle = random(TWO_PI);

    // enemies spawn at a random x and y in a circle around the center the base off screen
    enemy.x = baseCenterX + cos(angle) * enemyStats.spawnRadius;
    enemy.y = baseCenterY + sin(angle) * enemyStats.spawnRadius;

    // the distance / direction to the center
    var distanceX = baseCenterX - enemy.x;
    var distanceY = baseCenterY - enemy.y;
    var totalDistance = dist(enemy.x, enemy.y, baseCenterX, baseCenterY);

    // how fast the enemies move depending on their speed
    enemy.xSpeed = distanceX / totalDistance * enemyStats.speed;
    enemy.ySpeed = distanceY / totalDistance * enemyStats.speed;

    enemyToDraw = new Sprite(enemySprite, enemy.x, enemy.y, 4);

    enemies.push(enemy);
}

function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        var ox = enemies[i].engagedTroop !== null ? random(-2, 2) : 0;
        var oy = enemies[i].engagedTroop !== null ? random(-2, 2) : 0;
        fill(255, 0, 0);
        noStroke();
        // circle(enemies[i].x + ox, enemies[i].y + oy, enemies[i].size);
        enemyToDraw.x = enemies[i].x + ox;
        enemyToDraw.y = enemies[i].y + oy;
        enemyToDraw.drawEnemy();
        if (enemies[i].health < enemies[i].maxHealth) {
            drawHealthBar(enemies[i].x, enemies[i].y, enemies[i].size, enemies[i].health, enemies[i].maxHealth);
        }
    }
}

function drawWaveAnimation(barWidthPixels) {
    if (!waveInProg) {
        // arc cooldown symbol — same style as the tower placement arc
        var elapsed = currentPrepTime - prepTimeFrames;
        var progress = elapsed * (TWO_PI / currentPrepTime);
        var cx = width / 2;
        var cy = height - 30;
        angleMode(RADIANS);
        noFill();
        stroke(0);
        strokeWeight(6);
        arc(cx, cy, 40, 40, -HALF_PI, TWO_PI - HALF_PI - progress);
        stroke(255, 84, 84);
        strokeWeight(4);
        arc(cx, cy, 40, 40, -HALF_PI, TWO_PI - HALF_PI - progress);
        noStroke();
    } else {
        var framesSinceWaveStart = waveConfig.waveLength - waveTimer;
        strokeWeight(8);
        stroke(0);
        line(width - (barWidthPixels / waveConfig.waveLength) * framesSinceWaveStart, height - 4, width - barWidthPixels, height - 4);
        strokeWeight(6);
        stroke(245, 66, 66);
        line(width - (barWidthPixels / waveConfig.waveLength) * framesSinceWaveStart, height - 4, width - barWidthPixels, height - 4);
        noStroke();
    }
}

function drawWaveNumber() {
    var textHeight = 35;
    var textOffset = 180;
    fill(255);
    stroke(0);
    strokeWeight(2);
    textSize(textHeight);
    textAlign(LEFT);
    text("Wave: " + waveNum, width - textOffset, height - textHeight);
    drawWaveAnimation(textOffset);
    noStroke();
}

function enemyKilled(enemyIndex, tower = null) {
    // free any troop locked in combat so it can resume
    if (enemies[enemyIndex].engagedTroop !== null) {
        enemies[enemyIndex].engagedTroop.engagedEnemy = null;
    }
    if (tower != null) {
        killedEnemies.push({x: enemies[enemyIndex].x, y: enemies[enemyIndex].y, frame: frameCount, ox: random(-20, 20), oy: random(-20, 20)});
    } else {
        killedEnemies.push({x: playerStats.x, y: playerStats.y, frame: frameCount, ox: random(-20, 20), oy: random(-20, 20)});
    }
    enemies.splice(enemyIndex, 1);
    playerStats.money += enemyStats.moneyDropped;
}
