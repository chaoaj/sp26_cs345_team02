// This is the main file for the game. This should be where everything the main game should be
// i.e images go into the preload function

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

    updateEnemies();
    drawEnemies();
  } else if (currentScreen == "settings") {
    drawSettingsScreen();
  } else if (currentScreen == "encyclopedia") {
    drawEncyclopediaScreen();
  }
}