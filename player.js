// spritesheet is 360 x 90, 4 frames. each frame is 90 x 90

var playerWidth = 40;
var playerHeight = 40;
var playerStats;

function setupPlayer() {
  // obj thats player, speed can be changed
  playerStats = {
    // the current x and y position that the player spawns at
    // currently in the center where the base will be
    x: width / 2,
    y: width / 2,
    speed: 8
  };
}

// this just draws the player
function drawPlayer() {
  fill(0);
  circle(playerStats.x, playerStats.y, playerWidth, playerHeight);
}

