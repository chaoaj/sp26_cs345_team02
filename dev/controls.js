var lastInput = {};
var leftBumperHeld;
var rightBumperHeld;
var controllerUp;
var controllerLeft;
var controllerDown;
var controllerRight;
var previewTower;
//var selectedIndex = 0; // in title screen, tracks is currently hovered
let buttons = []; // stores button objects

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
    if (lastInput.direction == "UP") playerStats.y -= playerStats.speed * dy;
    if (lastInput.direction == "DOWN") playerStats.y += playerStats.speed * dy;
  } else if (up) {
      playerStats.y -= playerStats.speed * dy;
  } else if (down) {
      playerStats.y += playerStats.speed * dy;
  }
  playerStats.y = constrain(playerStats.y, -WORLD_SIZE / 2, WORLD_SIZE / 2);

  if (right && left) {
    if (lastInput.direction == "RIGHT") {
      playerStats.x += playerStats.speed * dx;
      playerStats.facing = "RIGHT";
    }
    if (lastInput.direction == "LEFT") {
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
  playerStats.x = constrain(playerStats.x, - WORLD_SIZE / 2, WORLD_SIZE / 2);
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
  if (lastInput.type != "KEYBOARD") {
    lastInput.type = "KEYBOARD";
    updateButtonHighlight();
    pauseSelectedIndex = -1;
  }
  //console.log(keyCode);

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
    lastInput.direction = MOVEMENT_KEYS[keyCode];
  }

  // ----- GAME CONTROLS ------
  if (keyCode == 80 && currentScreen == "game") {
    paused = !paused;
    pauseMenuTab = null;
    pauseSelectedIndex = lastInput.type === "CONTROLLER" ? 0 : -1;
  }

  // Shift + R: Reset
  if (keyIsDown(82) && keyIsDown(16) && currentScreen == "game") resetGame();

  // T - place a tower at the player's current position
  if (keyCode == 84) previewTower = true;

  // U - upgrade the hovered tower
  if (keyCode == 85) upgradeTower();

  // Q - sell the hovered tower (moved off mouse click to avoid OS-level conflicts)
  if (keyCode == 81) sellTower();

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

  //console.log("key:", key, "keyCode:", keyCode);

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

function keyReleased() {
  if (keyCode == 84) {
    previewTower = false;
    placeTower(playerStats.x, playerStats.y);
  }
}

function mousePressed() {
  // Mouse clicks are reserved for the pause menu only — gameplay sell/upgrade
  // run on keys (Q / U) so casual clicks don't collide with game actions.

  // ^^^^^
  // why? what is the reason for mouse clicks to be reserved for the pause menu?


  userStartAudio();
  if (!musicStarted) {
    musicStarted = true;
    menuMusic.play();
  }

  if (isMuted) {
    menuMusic.volume = 0;
  }

  if (paused && currentScreen == "game") {
    handlePauseMenuClick(mouseX, mouseY);
  }
}

function mouseMoved() {
  if (lastInput.type != "KEYBOARD") {
    lastInput.type = "KEYBOARD";
    updateButtonHighlight();
    pauseSelectedIndex = -1;
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
  lastInput.type = "CONTROLLER";

  if (paused || (currentScreen != "game" && currentScreen != "fading")) {
    processControllerSelections(e);
    return;
  }
  console.log("key:", e.name);

  const CONTROLLER_MAP = {
    axesUp: "UP",
    axesDown: "DOWN",
    axesLeft: "LEFT",
    axesRight: "RIGHT"
  };

  if (CONTROLLER_MAP[e.name]) lastInput.direction = CONTROLLER_MAP[e.name];

  if (e.name == "axesUp") controllerUp = true;
  if (e.name == "axesDown") controllerDown = true;
  if (e.name == "axesLeft") controllerLeft = true;
  if (e.name == "axesRight") controllerRight = true;

  if (e.name == "keypadUp") {
    currentTower = 0;
    updateTower();
  }

  if (e.name == "keypadRight") {
    currentTower = 1;
    updateTower();
  }

  if (e.name == "keypadDown") {
    currentTower = 2;
    updateTower();
  }

  if (e.name == "keypadLeft") {
    currentTower = 3;
    updateTower();
  }

  if (e.name == "rightAxesLeft") { // cycle left with right joystick
    currentTower--;

    if (currentTower < 0) currentTower = inventory.length - 1;
    updateTower();
  }

  if (e.name == "rightAxesRight") { // cycle right with right joystick
    currentTower++;

    if (currentTower > 3) currentTower = 0;
    updateTower();
  }

  if (e.name == "bumperLeft") leftBumperHeld = true; // left bumper

  if (e.name == "bumperRight") rightBumperHeld = true; // right bumper

  if (e.name == "select" && currentScreen == "game") {
    paused = !paused;
    pauseMenuTab = null;
  }

  if (leftBumperHeld && rightBumperHeld && currentScreen == "game") resetGame(); // pause with "select"

  if (e.name == "buttonBlue") {
    previewTower = true; // place towers with blue button
  }
  if (e.name == "buttonRed") {
    sellTower();
  }
  if (e.name == "buttonYellow") {
    upgradeTower();
  }
}

function onRelease(e) {
  if (e.name == "axesUp") controllerUp = false;
  if (e.name == "axesDown") controllerDown = false;
  if (e.name == "axesLeft") controllerLeft = false;
  if (e.name == "axesRight") controllerRight = false;
  if (e.name == "bumperLeft") leftBumperHeld = false;
  if (e.name == "bumperRight") rightBumperHeld = false;
  if (e.name == "buttonBlue") {
    previewTower = false;
    placeTower(playerStats.x, playerStats.y);
  }
}

function processControllerSelections(e) {

  if(!menuButtons || menuButtons.length == 0) {
    return;
  }

  if (e.name == "axesDown") {
      selectedIndex = (selectedIndex + 1) % menuButtons.length;
      updateButtonHighlight();
  }
  if (e.name == "axesUp") {
      selectedIndex = (selectedIndex - 1 + menuButtons.length) % menuButtons.length;
      updateButtonHighlight();
  }
  if (paused && currentScreen == "game") {
    if (pauseSelectedIndex === null) {
      pauseSelectedIndex = 0;
    }
    var rects = pauseMenuButtonRects();
    var keys = Object.keys(rects);
    if (e.name == "axesDown") pauseSelectedIndex = (pauseSelectedIndex + 1) % keys.length;
    if (e.name == "axesUp") pauseSelectedIndex = (pauseSelectedIndex - 1 + keys.length) % keys.length;
    if (e.name == "buttonRed") {
      if (pauseMenuTab === "keybinds" || pauseMenuTab === "towers") {
        pauseMenuTab = null;
        pauseSelectedIndex = 0;
      } else if (pauseMenuTab === null){
        paused = !paused;
      }
    }
    if (e.name == "buttonGreen") {
        var selected = keys[pauseSelectedIndex];
        if (selected === "keybinds") {
          pauseMenuTab = "keybinds";
          pauseSelectedIndex = 0;
        }
        else if (selected === "towers") {
          pauseMenuTab = "towers";
          pauseSelectedIndex = 0;
        }
        else if (selected === "back") {
          pauseMenuTab = null;
          pauseSelectedIndex = 0;
        }
    }
    return;
  }
  if (e.name == "buttonRed") {
    switch (currentScreen) {
      case "title": break;
      case "encyclopedia":
      case "story":
      case "settings": goToTitle();
      break;
      default: break;
    }
  }
  if (e.name == "buttonGreen") {
    switch(currentScreen) {
        case "title":
            switch(selectedIndex) {
                case 0: startGame();
                break;
                case 1: openSettings();
                break;
                case 2: openEncyclopedia();
                break;
                case 3: toggleMute();
                break;
            }
            break;
        case "encyclopedia":
        case "story":
        case "enemies":
              switch(selectedIndex) {
                  case 0: encyclopediaNext();
                  break;
                  case 1: goToTitle();
                  break;
              }
              break;
        case "settings":
            switch(selectedIndex) {
                case 0: goToTitle()
                 break;
            }
            break;
        case "gameover":
          switch(selectedIndex) {
              case 0: resetGame(); break;
          }
          break;
      case "win":
          switch(selectedIndex) {
              case 0: keepPlaying(); break;
              case 1: resetGame(); break;
          }
          break;
    }
  }
}
