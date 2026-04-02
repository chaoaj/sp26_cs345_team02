// empty array that stores all the enemies that are on the screen
var enemies = [];

// just an object that holds the stats of the enemy
var enemyStats = {
    // size of the enemy (circle);
    size: 15,
    // movement speed
    speed: 3,
    // how far from the center enemies spawn on the canvas
    // bigger num = farther
    spawnRadius: 800
};

var waveNum = 1;

var waveInProg = false;

// this is in frames, basically it means that if this var were for example 120,
// you would have 2 seconds of prep time before enemies spawn
var prepTime = 200

// counts down until the next enemy can spawn in a current wave
var enemyTimer = 0;

// how many frames the game waits before spawning a new enemy
// smaller num = faster spawn times
var enemyDelay = 20;

// how long the wave lasts, in frames again so 240 = 4 secs at 60fps
// or n / 60 = seconds
var waveTimer = 240

// how long a wave should last before completley resetting
var waveLength = 1200;


function updateEnemies() {
    if (waveInProg == false) {
        prepTime--;

        if (prepTime <= 0) {
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

function beginWave() {
    waveInProg = true;
    waveTimer = waveLength;
    enemyTimer = 0;
}

function stopWave() {
    waveInProg = false;
    waveNum++;
    prepTime = 60;
}

function spawnEnemy() {
    var enemy = {};

    enemy.size = enemyStats.size;

    // this is the center of the map (or the base)
    var baseCenterX = width / 2;
    var baseCenterY = height / 2;

    // TWO_PI is just a circle, it selects a random angle from 360 degrees
    var angle = random(TWO_PI);

    // enemies spawn at a random x and y in a circle around the center the base off screen
    enemy.x = baseCenterX + cos(angle) * enemyStats.spawnRadius;
    enemy.y = baseCenterY + sin(angle) * enemyStats.spawnRadius;

    // the distance / direction to the center
    var distanceX = baseCenterX - enemy.x;
    var distanceY = baseCenterY - enemy.y;
    var totalDistance = dist(enemy.x, enemy.y, baseCenterX, baseCenterY);

    // how fast the enemies move dependign on their speed
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

function checkEnemyPosition() {

}

function enemyMovementTowardTowers() {

}
