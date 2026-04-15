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
  var up = keyIsDown(87) || controllerUp;       // W
  var left = keyIsDown(65) || controllerLeft;   // A
  var down = keyIsDown(83) || controllerDown;   // S
  var right = keyIsDown(68) || controllerRight; // D

  if (up && down) {
    if (lastInput == "UP") playerStats.y -= playerStats.speed;
    if (lastInput == "DOWN") playerStats.y += playerStats.speed;
  } else if (up) {
      playerStats.y -= playerStats.speed;
  } else if (down) {
      playerStats.y += playerStats.speed;
  }
  playerStats.y = constrain(playerStats.y, 40, height - 40);

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

/**
 * Reads all key inputs event in order for the games functionality.
 * 
 * Includes:
 * - Movement tracking (WASD)
 * - Pause toggle (P)
 * - Resetting game (Shift + R)
 * - Placing tower (T)
 * - Cycling inventory (1-4, ",", and ".")
 * 
 */
function keyPressed() {
  console.log(keyCode);

  // ----- MOVEMENT -----
  const MOVEMENT_KEYS = {
    87: "UP",   // W
    65: "LEFT", // A
    83: "DOWN", // S
    68: "RIGHT" // D
  };

  if (MOVEMENT_KEYS[keyCode]) {
    lastInput = MOVEMENT_KEYS[keyCode];
  }

  // ----- GAME CONTROLS ------
  if (keyCode == 80 && currentScreen == "game") paused = !paused;

  // Shift + R: Reset
  if (keyIsDown(82) && keyIsDown(16)) resetGame();

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
