// This is the main file for the game. This should be where everything the main game should be
// i.e images go into the preload function

var base = {
  x: 500,
  y: 500,
  size: 135,
  health: healthConfig.base,
  maxHealth: healthConfig.base
};

var controller;
var paused = false;

// this loads the images
function preload() {
  playerSprite = loadImage("images/PlayerWalkNew.png");

  // loads main menu images
  titleBg = loadImage("images/titleBackground.png");
  titleLogo = loadImage("images/FrontGuardTitle.png");
  titlePlayButton = loadImage("images/PlayButton.png");
  titleSettingsButton = loadImage("images/settingsButton.png");
  titleEncyclopediaButton = loadImage("images/EncyclopediaButton.png");

  // this loads tower images
  towerImages.normal = loadImage("images/normalTower.png");
  towerImages.attack = loadImage("images/towerAttack.png");
  towerImages.healing = loadImage("images/towerHealing.png");
  towerImages.explosive = loadImage("images/towerExplosive.png");
  
  // base images
  baseImage = loadImage("images/towernormal.png");
  baseDamageImage = loadImage("images/towerdamage.png");

  // grass background
  grassBg = loadImage("images/grassBackground.png");
}

function setup() {
  createCanvas(1000, 1000);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);

  setupTitleScreen();
  setupPlayer();

  placeableArea.x = width / 2 - placeableArea.size / 2;
  placeableArea.y = width / 2 - placeableArea.size / 2;

  controller = createController();

  controller.onButtonPressed(onPress);
  controller.onAxesPressed(onPress);

  controller.onButtonReleased(onRelease);
  controller.onAxesReleased(onRelease);

  // set up base image
  mainBase = new Sprite(baseImage, base.x, base.y, 2);
}

function drawBase() {
  // base body
  fill(80, 180, 80);
  stroke(0);
  strokeWeight(2);
  rectMode(CENTER);
  // rect(base.x, base.y, base.size, base.size);

  // "BASE" label
  fill(255);
  noStroke();
  textSize(30);
  textAlign(CENTER, CENTER);
  // text("BASE", base.x, base.y);
  mainBase.drawBase();

  drawHealthBar(base.x, base.y, base.size + 10, base.health, base.maxHealth);

  if (base.health == base.maxHealth / 2) {
    mainBase.sheet = baseDamageImage;
  }
}

// shared health bar renderer used by towers, players, and the base
function drawHealthBar(x, y, barWidth, health, maxHealth) {
  var ratio = max(0, health / maxHealth);
  var barH = 5;
  var barY = y - barWidth / 2 - 8;

  stroke(0);
  strokeWeight(0.5);
  fill(200, 0, 0);
  rectMode(CORNER);
  rect(x - barWidth / 2, barY, barWidth, barH);

  fill(0, 200, 0);
  rect(x - barWidth / 2, barY, barWidth * ratio, barH);
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
  if (paused) return;
  enemies = [];
  towers = [];
  base.health = base.maxHealth;
  waveInProg = false;
  waveNum = 1;
  prepTime = 200;
  paused = false;
  currentScreen = "title";
  showTitleScreenElements();
  setupPlayer();
}

function draw() {
  controller.draw(width/2, height/2);

  if (currentScreen == "title") {
    drawTitleScreen();
  } else if (controller.controllersNotCalibrated().length > 0) {
    controller.calibrate(true);
    return
  } else if (currentScreen == "game") {
    imageMode(CORNER);
    image(grassBg, 0, 0, width, height);
    imageMode(CENTER);

    if (!paused) {
      movePlayer();
      checkBaseCollisions();
      if (currentScreen != "game") return;
      updateEnemies();
      checkTowerCollisions();
      checkPlayerCollisions();
      CheckHealth();
    }

    drawEnemies();
    drawTowers();
    towerPlaceCoolDownAnimation();
    moneyAnimation();
    drawBase();
    drawPlayer();
    drawMoney();
    drawInventory();

    // quick check if the game is paused
    if (paused) {
      fill(0, 0, 0, 120);
      noStroke();
      rectMode(CORNER);
      rect(0, 0, width, height);
      fill(255);
      textSize(48);
      textAlign(CENTER, CENTER);
      text("PAUSED", width / 2, height / 2);
    }
  } else if (currentScreen == "settings") {
    drawSettingsScreen();
  } else if (currentScreen == "encyclopedia") {
    drawEncyclopediaScreen();
  }
}
