var finalBossWave = 10; // normal is 10

var finalBossSpawned = false;

var finalBossDefeated = false;

var bossPhaseActive = false;

var finalBossStats = {
    health: 3000, // can edit this if its too much
    size: 100,
    speed: 1, // base is 1
    maxSpeed: 1,
    spawnRadius: 1500,
    moneyDropped: 1000,
    maxMoneyDropped: 2000,
}

function spawnFinalBoss() {
    if (finalBossSpawned) {
        return;
    }

    console.log("BOSS TEST");

    var boss = {}

    boss.isSpecial = false;
    boss.isFinalBoss = true;

    boss.size = finalBossStats.size;
    boss.speed = finalBossStats.speed;
    boss.health = finalBossStats.health
    boss.maxHealth = boss.health
    boss.moneyDropped = finalBossStats.moneyDropped;

    boss.engagedTroop = null;
    boss.lastAttackFrame = 0;
    boss.spriteSheet = enemyFinalBossSprite;

    // this is the center of the map (or the base)
    var baseCenterX = base.x;
    var baseCenterY = base.y;

    // TWO_PI is just a circle, it selects a random angle from 360 degrees
    //angleMode(RADIANS);
    var angle = random(TWO_PI);

    // enemies spawn at a random x and y in a circle around the center the base off screen
    boss.x = baseCenterX + cos(angle) * finalBossStats.spawnRadius;
    boss.y = baseCenterY + sin(angle) * finalBossStats.spawnRadius;

    // the distance / direction to the center
    var distanceX = baseCenterX - boss.x;
    var distanceY = baseCenterY - boss.y;
    var totalDistance = dist(boss.x, boss.y, baseCenterX, baseCenterY);

    // how fast the enemies move depending on their speed
    boss.xSpeed = distanceX / totalDistance * boss.speed;
    boss.ySpeed = distanceY / totalDistance * boss.speed;

    boss.spriteObj = new Sprite(boss.spriteSheet, boss.x, boss.y, 4);

    enemies.push(boss);

    finalBossSpawned = true;
}

function finalBossReachedBase() {
    bossPhaseActive = false;
    waveInProg = false;
    enemies = [];

    showGameOver();
}

function getFinalBossEnemy() {
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].isFinalBoss) {
            return enemies[i];
        }
    }

    return null;
}

