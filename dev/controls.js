var playerWidth = 40;
var playerHeight = 40;
var playerStats;

var lastInput = null;

function setup() {
  createCanvas(400, 400);

  // obj thats player, speed can be changed
  playerStats = {
  // the current x and y position that the player spawns at
  // currently in the center where the base will be
  x: width / 2,
  y: width / 2,
  speed: 8
  };  
}

function draw() {
  background(220);
  movePlayer();
}

function movePlayer() {

  // W
  var up = keyIsDown(87); 
  // A
  var left = keyIsDown(65);
  // S
  var down = keyIsDown(83);
  // D
  var right = keyIsDown(68);

  /*
  This block of code prevents the player from being "locked" if they were to press
  either up or down at the same time. Instead, the last movement key inputed from the player
  will register instead using the lastInput variable, offering a greater feel for movement.
  */
  if (up && down) {
    if (lastInput == "UP") playerStats.y -= playerStats.speed;
    if (lastInput == "DOWN") playerStats.y += playerStats.speed;
  } else if (up) {
      playerStats.y -= playerStats.speed;
  } else if (down) {
      playerStats.y += playerStats.speed;
  }
  
  /*
  Same reason, but this time for right and left
  */
  if (right && left) {
    if (lastInput == "RIGHT") playerStats.x += playerStats.speed;
    if (lastInput == "LEFT") playerStats.x -= playerStats.speed;
  } else if (right) {
      playerStats.x += playerStats.speed;
  } else if (left) {
      playerStats.x -= playerStats.speed;
  }
}

function keyPressed() {
  // W
  if (keyCode == 87) lastInput = "UP";
  // A
  if (keyCode == 65) lastInput = "LEFT";
  // S
  if (keyCode == 83) lastInput = "DOWN";
  // D
  if (keyCode == 68) lastInput = "RIGHT";
}

// this just draws the player
function drawPlayer() {
  fill(0);
  circle(playerStats.x, playerStats.y, playerWidth, playerHeight);
}