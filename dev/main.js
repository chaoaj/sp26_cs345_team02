// This is the main file for the game. This should be where everything the main game should be

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  drawPlayer();
  movePlayer();
}

// this just draws the player
function drawPlayer() {
  fill(0);
  circle(playerStats.x, playerStats.y, playerWidth, playerHeight);
}