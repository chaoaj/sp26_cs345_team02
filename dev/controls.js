var lastInput = null;
var controllerUp;
var controllerLeft;
var controllerDown;
var controllerRight;

function movePlayer() {

  // W
  var up = keyIsDown(87) || controllerUp;
  // A
  var left = keyIsDown(65) || controllerLeft;
  // S
  var down = keyIsDown(83) || controllerDown;
  // D
  var right = keyIsDown(68) || controllerRight;

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
  playerStats.y = constrain(playerStats.y, 40, height - 40);

  /*
  Same reason, but this time for right and left
  */
  if (right && left) {
    if (lastInput == "RIGHT") {
      playerStats.x += playerStats.speed;
      playerStats.facing = "RIGHT";
    }
    if (lastInput == "LEFT") {
      playerStats.x -= playerStats.speed;
      playerStats.facing = "LEFT";
    }
  } else if (right) {
      playerStats.x += playerStats.speed;
      playerStats.facing = "RIGHT";
  } else if (left) {
      playerStats.x -= playerStats.speed;
      playerStats.facing = "LEFT";
  }
  playerStats.x = constrain(playerStats.x, 30, width - 30);
}

function keyPressed() {
  console.log(keyCode);
  // W
  if (keyCode == 87) {
    up = true;
    lastInput = "UP";
  }
  // A
  if (keyCode == 65) {
    left = true;
    lastInput = "LEFT";
  }
  // S
  if (keyCode == 83) {
    down = true;
    lastInput = "DOWN";
  }
  // D
  if (keyCode == 68) {
    right = true;
    lastInput = "RIGHT";
  }
  // P - toggle pause (only during gameplay)
  if (keyCode == 80 && currentScreen == "game") {
    paused = !paused;
  }

  // R - reset to main menu
  if (keyIsDown(82) && keyIsDown(16) && currentScreen == "game") {
    resetGame();
  }

  // T - place a tower at the player's current position
  if (keyCode == 84) {
    placeTower(playerStats.x, playerStats.y);
  }

  // 1-3 - select tower type
  if (keyCode == 49) {
    activeTowerType = "normal";
  }
  if (keyCode == 50) {
    activeTowerType = "attack";
  }
  if (keyCode == 51) {
    activeTowerType = "healing";
  }
}

// controller inputs functions will go below here
function onPress(e) {
  if (e.name == "axesUp"){
    lastInput = "UP";
    controllerUp = true;
    }
    if (e.name == "axesDown"){
      lastInput = "DOWN";
      controllerDown = true;
    }
    if (e.name == "axesLeft"){
      lastInput = "LEFT";
      controllerLeft = true;
    }
    if (e.name == "axesRight"){
      lastInput = "RIGHT";
      controllerRight = true;
    }
    if (e.name == "buttonBlue") placeTower(playerStats.x, playerStats.y);
}

function onRelease(e) {
  if (e.name == "axesUp"){
    controllerUp = false;
    }
    if (e.name == "axesDown"){
      controllerDown = false;
    }
    if (e.name == "axesLeft"){
      controllerLeft = false;
    }
    if (e.name == "axesRight"){
      controllerRight = false;
    }
}
