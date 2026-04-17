var lastInput = null;
var controllerUp;
var controllerLeft;
var controllerDown;
var controllerRight;

/**
 *  Moves the player with WASD or controller input if controller is detected.
 *
 * Prioritizes most recent direction stored with "lastInput", preventing conflicts with movement.
 * Constrains the player to the canvas.
*/
function movePlayer() {

  var dx = 1;
  var dy = 1;

  var up = keyIsDown(87) || keyIsDown(UP_ARROW) || controllerUp;       // W, UP ARROW, CONT UP
  var left = keyIsDown(65) || keyIsDown(LEFT_ARROW) || controllerLeft;   // A, LEFT ARROW, CONT LEFT
  var down = keyIsDown(83) || keyIsDown(DOWN_ARROW) || controllerDown;   // S, DOWN ARROW, CONT DOWN
  var right = keyIsDown(68) || keyIsDown(RIGHT_ARROW)  || controllerRight; // D, RIGHT ARROW, CONT RIGHT
  

  if ((up || down) && (right || left)) {
    dx = 1 / Math.sqrt(2);
    dy = 1 / Math.sqrt(2);
  }

  if (up && down) {
    if (lastInput == "UP") playerStats.y -= playerStats.speed * dy;
    if (lastInput == "DOWN") playerStats.y += playerStats.speed * dy;
  } else if (up) {
      playerStats.y -= playerStats.speed * dy;
  } else if (down) {
      playerStats.y += playerStats.speed * dy;
  }
  playerStats.y = constrain(playerStats.y, 40, height - 40);

  if (right && left) {
    if (lastInput == "RIGHT") {
      playerStats.x += playerStats.speed * dx;
      playerStats.facing = "RIGHT";
    }
    if (lastInput == "LEFT") {
      playerStats.x -= playerStats.speed * dx;
      playerStats.facing = "LEFT";
    }
  } else if (right) {
      playerStats.x += playerStats.speed * dx;
      playerStats.facing = "RIGHT";
  } else if (left) {
      playerStats.x -= playerStats.speed * dx;
      playerStats.facing = "LEFT";
  }
  playerStats.x = constrain(playerStats.x, 30, width - 30);
}

/**
 * Reads all key inputs event in order for the games functionality.
 *
 * Includes:
 * - Movement tracking (WASD & Arrow Keys)
 * - Pause toggle (P)
 * - Resetting game (Shift + R)
 * - Placing tower (T)
 * - Cycling inventory (1-4, ",", and ".")
 */
function keyPressed() {
  console.log(keyCode);

  // ----- MOVEMENT -----
  const MOVEMENT_KEYS = {
    87: "UP",    // W
    65: "LEFT",  // A
    83: "DOWN",  // S
    68: "RIGHT", // D
    // ARROW KEYS
    38: "UP",    // Up arrow
    37: "LEFT",  // Left arrow
    40: "DOWN",  // Down arrow
    39: "RIGHT"  // Right arrow
  };

  if (MOVEMENT_KEYS[keyCode]) {
    lastInput = MOVEMENT_KEYS[keyCode];
  }

  // ----- GAME CONTROLS ------
  if (keyCode == 80 && currentScreen == "game") paused = !paused;

  // Shift + R: Reset
  if (keyIsDown(82) && keyIsDown(16) && currentScreen == "game") resetGame();

  // T - place a tower at the player's current position
  if (keyCode == 84) placeTower(playerStats.x, playerStats.y);

  // 1-4 - select tower type
  if (keyCode == 49) {
    currentTower = 0;
    updateTower();
  }

  if (keyCode == 50) {
    currentTower = 1;
    updateTower();
  }
  if (keyCode == 51) {
    currentTower = 2;
    updateTower();
  }
  if (keyCode == 52) {
    currentTower = 3;
    updateTower();
  }

  console.log("key:", key, "keyCode:", keyCode);

  // ----- NUMPAD (1-4) -----

  if (keyCode == 97) {
    currentTower = 0;
    updateTower();
  }

  if (keyCode == 98) {
    currentTower = 1;
    updateTower();
  }

  if (keyCode == 99) {
    currentTower = 2;
    updateTower()
  }

  if (keyCode == 100) {
    currentTower = 3;
    updateTower();
  }

  // cycling left in inventory with "<" or ","
  if (key == "," || key == "<") {
    currentTower--;

    if (currentTower < 0) currentTower = inventory.length - 1;
    updateTower();
  }

  // cycling right in inventory with ">" or "."
  if (key == "." || key == ">") {
    currentTower++;

    if (currentTower >= inventory.length) currentTower = 0
    updateTower();
  }


}

/**
 * Handles controller button inputs.
 *
 * Updates movement direction using axes and changes lastInput variable.
 * Allows player to place a tower.
 *
 * @param {Object} e - Controller event that handles controller input
 */
function onPress(e) {

  const CONTROLLER_MAP = {
    axesUp: "UP",
    axesDown: "DOWN",
    axesLeft: "LEFT",
    axesRight: "RIGHT"
  };

  if (CONTROLLER_MAP[e.name]) lastInput = CONTROLLER_MAP[e.name];

  if (e.name == "axesUp") controllerUp = true;
  if (e.name == "axesDown") controllerDown = true;
  if (e.name == "axesLeft") controllerLeft = true;
  if (e.name == "axesRight") controllerRight = true;

  if (e.name == "buttonBlue") placeTower(playerStats.x, playerStats.y);
}

function onRelease(e) {
  if (e.name == "axesUp") controllerUp = false;
  if (e.name == "axesDown") controllerDown = false;
  if (e.name == "axesLeft") controllerLeft = false;
  if (e.name == "axesRight") controllerRight = false;
}
