// empty array that stores all the enemies that are on the screen
var enemies = [];
// stores dead enemy positions and the frame they died on
var killedEnemies = [];

// wave scaling — all rates are in enemies per second
var waveConfig = {
    waveLength: 1200,  // frames per wave (20s at 60fps)
    totalPrepTime: 120, // frames per break (2s at 60fps)
    baseSpawnRate: 10,  // enemies/sec on wave 1
    spawnIncreasePerWave: 1,  // enemies/sec added each wave
    maxSpawnRate: 12   // enemies/sec cap
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
    speed: 3,
    // how far from the center enemies spawn on the canvas
    // bigger num = farther
    spawnRadius: 800,
    // decides how much money is given to the player when this enemy is killed
    moneyDropped: 5
};

var waveNum = 1;

var waveInProg = false;

// this is in frames, basically it means that if this var were for example 120,
// you would have 2 seconds of prep time before enemies spawn
var prepTimeFrames = waveConfig.totalPrepTime;

// counts down until the next enemy can spawn in a current wave
var enemyTimer = 0;

// current spawn delay in frames — set each wave by beginWave()
var enemyDelay = spawnRateToDelay(waveConfig.baseSpawnRate);

// counts down the remaining frames in the current wave
var waveTimer = 0;


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

        if (enemies[i].x < -150 ||
            enemies[i].x > width + 150 ||
            enemies[i].y < -150 ||
            enemies[i].y > height + 150)
            {
            enemies.splice(i, 1);
            }
    }
}

// returns the nearest tower to the enemy, or the base if no towers exist
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
    prepTimeFrames = waveConfig.totalPrepTime;
}

function spawnEnemy() {
    var enemy = {};

    enemy.size = enemyStats.size;

    // this is the center of the map (or the base)
    var baseCenterX = width / 2;
    var baseCenterY = height / 2;

    // TWO_PI is just a circle, it selects a random angle from 360 degrees
    angleMode(RADIANS);
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

    enemies.push(enemy);
}

function drawEnemies() {
    fill(255, 0, 0);
    noStroke();

    for (var i = 0; i < enemies.length; i++) {
        circle(enemies[i].x, enemies[i].y, enemies[i].size);
    }
}

function drawWaveAnimation(barWidthPixels) {
    if (!waveInProg) {
        var framesSinceLastWave = waveConfig.totalPrepTime - prepTimeFrames;
        strokeWeight(8);
        stroke(0);
        line(width - barWidthPixels + (barWidthPixels / waveConfig.totalPrepTime) * framesSinceLastWave, height - 4, width - barWidthPixels, height - 4);
        strokeWeight(6);
        stroke(245, 66, 66);
        line(width - barWidthPixels + (barWidthPixels / waveConfig.totalPrepTime) * framesSinceLastWave, height - 4, width - barWidthPixels, height - 4);
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

function enemyKilled(enemyIndex, towerIndex) {
    if (towerIndex != -1) {
        killedEnemies.push({x: towers[towerIndex].x, y: towers[towerIndex].y, frame: frameCount});
    } else {
        killedEnemies.push({x: playerStats.x, y: playerStats.y, frame: frameCount});
    }
    enemies.splice(enemyIndex, 1);
    playerStats.money += enemyStats.moneyDropped;
}
