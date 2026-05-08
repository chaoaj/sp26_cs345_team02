/**
 * main.js is the main file of the game. This is where images and draw() functions should go.
 * Images go into the preload() function.
*/

// test
const WORLD_SIZE = 2048 // image size of the bg
// ----- Resolution Size -----
var windowWidth = 1080
var windowHeight = 1920

// ----- Game Variables -----
var paused = false;
var controller;

// ----- Fonts -----
var textFonts = {};

// ----= Base Object ------
var base = {
  x: 0,
  y: 0,
  size: 160,
  health: healthConfig.base,
  maxHealth: healthConfig.base
};

// ----- Sound -----
let menuMusic = new Audio("audio/mainMenuMusic.mp3");
menuMusic.loop = true;
menuMusic.volume = 1;

let musicStarted = false;

let towerPlacementSound = new Audio("audio/PlaceTowerStructure01.wav");

/**
 * This function is called once to load assets before our game runs.
 * Any images are to go here.
*/
function preload() {
  // ----- Main Menu Images -----
  titleBg = loadImage("images/titleBackground.png");
  titleLogo = loadImage("images/FrontGuardTitle.png");
  titlePlayButton = loadImage("images/PlayButton.png");
  titleSettingsButton = loadImage("images/settingsButton.png");
  titleEncyclopediaButton = loadImage("images/EncyclopediaButton.png");

  // ----- Player Images -----
  playerSprite = loadImage("images/PlayerWalkNew.png");

  // ----- Enemy Image -----
  enemySprite = loadImage("images/enemyNormal.png");

  // ----- Tower images -----
  towerImages.normal = loadImage("images/normalTower.png");
  towerImages.attack = loadImage("images/towerAttack.png");
  towerImages.healing = loadImage("images/towerHealing.png");
  towerImages.explosive = loadImage("images/towerExplosive.png");

  // ----- Base Images -----
  baseImage = loadImage("images/towernormal.png");
  baseDamageImage = loadImage("images/towerdamage.png");

  // ----- Canvas images -----
  grassBg = loadImage("images/OLDgrassBackgroundOLD.png");

  // ----- Fonts -----
  textFonts.nunito = loadFont("fonts/static/Nunito-Regular.ttf");
  textFonts.openSans = loadFont("fonts/static/OpenSans-Regular.ttf");
  // ----- Sound -----
}

function setup() {
  // ----- Main Game Setup -----
  createCanvas(windowWidth, windowHeight); // makes the game fit into the window
  imageMode(CENTER);
  textAlign(CENTER, CENTER);

  setupTitleScreen();
  setupEndScreens();
  setupPlayer();
  spawnDecorations();

  base.x = 0;
  base.y = 0;

  // this is gonna be commented out cause the grass bg is 2048x2048 and i wanna
  // use that as the main canvas -Jason
  //placeableArea.x = width / 2 - placeableArea.size / 2;
  //placeableArea.y = height / 2 - placeableArea.size / 2;

  // ----- Controller Setup -----
  controller = createController();
  controller.onButtonPressed(onPress);
  controller.onAxesPressed(onPress);
  controller.onButtonReleased(onRelease);
  controller.onAxesReleased(onRelease);

  // ----- Base Setup -----
  mainBase = new Sprite(baseImage, base.x, base.y, 2);
}

/**
 * This function draws the main base the player is supposed to defend onto the screen.
 */
function drawBase() {

  mainBase.x = base.x;
  mainBase.y = base.y;

  mainBase.drawBase();

  drawHealthBar(base.x, base.y, base.size + 10, base.health, base.maxHealth);

  if (base.health == base.maxHealth / 2) {
    mainBase.sheet = baseDamageImage;
  }
}

// shared health bar renderer used by towers, players, and the base
/**
 * This functions draws a health bar that is shared
 * between towers, the player, and the main base.
 *
 * @param {*} x
 * @param {*} y
 * @param {*} barWidth
 * @param {*} health
 * @param {*} maxHealth
 */
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
      if (enemies[i].engagedTroop !== null) enemies[i].engagedTroop.engagedEnemy = null;
      base.health -= damageConfig.enemyToBase;
      enemies.splice(i, 1);

      if (base.health <= 0) {
        showGameOver();
        return;
      }
    }
  }
}

function resetGame() {
  if (paused) return;
  enemies = [];
  towers = [];
  explosives = [];
  arrows = [];
  troops = [];
  base.health = base.maxHealth;
  mainBase.sheet = baseImage;
  enemyStats.moneyDropped = 8;
  enemyStats.speed = 2;
  waveInProg = false;
  showAnnouncement = false;
  waveNum = 1;
  resetTowerUpgrades();
  currentPrepTime = waveConfig.prepTimeStart;
  prepTimeFrames = currentPrepTime;
  paused = false;
  pauseMenuTab = null;
  hideEndScreenButtons();
  setMenuButtons("title");
  currentScreen = "title";
  updateButtonHighlight();
  showTitleScreenElements();
  setupPlayer();
  spawnDecorations();
  resetInventory();
  cursor(ARROW);
}

function draw() {
  controller.draw(width/2, height/2);

  if (controller.controllersNotCalibrated().length > 0) {
    controller.calibrate(true);
    return;
  } if (currentScreen == "title") {
    drawTitleScreen();
  } else if (currentScreen == "game") {

    trackPausedFrame();
    if (!paused) {
      movePlayer();
      updateCamera();
      updateEnemies();
      updateTowers();
      updateExplosives();
      updateArrows();
      updateTroops();
      checkBaseCollisions();
      checkTowerCollisions();
      checkPlayerCollisions();
      CheckHealth();
    }

    push();
    translate(width / 2 - camera.x, height / 2 - camera.y);
    imageMode(CENTER);
    image(grassBg, 0, 0);
    drawDecorations();
    drawEnemies();
    drawTowers();
    drawExplosives();
    drawArrows();
    drawTroops();
    drawBase();
    drawPlayer();
    drawTowerPreview();
    drawTowerHoverPanel();

    pop();
    if (showAnnouncement) announcement.show();

    drawTowerPlaceCoolDownAnimation();
    moneyAnimation();
    drawMoney();
    drawWaveNumber();
    drawInventory();
    drawLiveTimer();

    // pause menu overlay (settings/keybinds/tower-types)
    if (paused) {
      drawPauseMenu();
    }
  } else if (currentScreen == "fading") {
    drawFadeTransition();
  } else if (currentScreen == "gameover") {
    drawGameOverScreen();
  } else if (currentScreen == "win") {
    drawWinScreen();
  } else if (currentScreen == "settings") {
    drawSettingsScreen();
  } else if (currentScreen == "encyclopedia") {
    drawEncyclopediaScreen();
  } else if (currentScreen == "story") {
    drawStoryScreen();
  } else if (currentScreen == "enemies") {
    drawEnemyScreen();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
