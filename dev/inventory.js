// this var is gonna be the order in which the towers will be placed in the inventory
// can be expanded upon based on how many towers we wanna
var inventory = ["normal", "healing", "attack", "explosive"];

// index for starting tower SLOT will always start at 0
// current tower INDEX
var currentTower = 0;

// current TYPE for the tower selected
var currentTowerType = inventory[currentTower];

function resetInventory() {
    currentTower = 0;
    updateTower();
}

/**
 * Makes the highlighted inventory slot align with the current tower type.
 */
function updateTower() {
    currentTowerType = inventory[currentTower];
    activeTowerType = currentTowerType;
}

/**
 * Draws the inventory UI on the top left corner of the screen.
 * The inventory is displayed with a square.
 * The current selected tower / slot is highlighted in green.
 */
function drawInventory() {
    var xPos = 30;
    var yPos = 30;
    var squareSize = 80;
    var spaces = 10;

    for (var i = 0; i < inventory.length; i++) {
        var x = xPos + i * (squareSize + spaces);
        var y = yPos;

        var type = inventory[i];

        // this highlights the slot green
        if (i == currentTower) {
            fill(0, 255, 0);
        } else {
            fill(200);
        }

        rect(x, y, squareSize, squareSize);

        if (towerImages && towerImages[type]) {
            image(towerImages[type], x + squareSize / 2, y + squareSize / 2, squareSize - 10, squareSize - 10);
        }
    }
    updateTower();
}
