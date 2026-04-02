// This is the main file for the game. This should be where everything the main game should be
// i.e images go into the preload function

var base = {
  x: 500,
  y: 500,
  size: 60,
  health: healthConfig.base,
  maxHealth: healthConfig.base
};

function drawBase() {
  // base body
  fill(80, 180, 80);
  stroke(0);
  strokeWeight(3);
  rectMode(CENTER);
  rect(base.x, base.y, base.size, base.size);

  // "BASE" label
  fill(255);
  noStroke();
  textSize(10);
  textAlign(CENTER, CENTER);
  text("BASE", base.x, base.y);

  drawHealthBar(base.x, base.y, base.size + 10, base.health, base.maxHealth);
}

function checkBaseCollisions() {
  for (var i = enemies.length - 1; i >= 0; i--) {
    var d = dist(enemies[i].x, enemies[i].y, base.x, base.y);
    if (d < base.size / 2 + enemies[i].size / 2) {
      base.health -= damageConfig.enemyToBase;
      enemies.splice(i, 1);

      if (base.health <= 0) {
        resetGame();
        return;
      }
    }
  }
}

function resetGame() {
  enemies = [];
  towers = [];
  base.health = base.maxHealth;
  waveInProg = false;
  waveNum = 1;
  prepTime = 200;
  currentScreen = "title";
  showTitleScreenElements();
}

// this loads the images
function preload() {
  titleBg = loadImage("images/titleBackground.png");
  titleLogo = loadImage("images/FrontGuardTitle.png");
  titlePlayButton = loadImage("images/PlayButton.png");
  titleSettingsButton = loadImage("images/settingsButton.png");
  titleEncyclopediaButton = loadimage("images/EncyclopediaButton.png");
}


function setup() {
  createCanvas(1000, 1000);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);

  setupTitleScreen();
  setupPlayer();
}

function draw() {
  if (currentScreen == "title") {
    drawTitleScreen();
  } else if (currentScreen == "game") {
    background(200);
    
    movePlayer();
    drawPlayer();

    drawBase();
    checkBaseCollisions();
    if (currentScreen != "game") return;

    updateEnemies();
    drawEnemies();

    drawTowers();
    checkTowerCollisions();
  } else if (currentScreen == "settings") {
    drawSettingsScreen();
  } else if (currentScreen == "encyclopedia") {
    drawEncyclopediaScreen();
  }
}