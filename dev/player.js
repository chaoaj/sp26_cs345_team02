// spritesheet is 360 x 90, 4 frames. each frame is 90 x 90

var playerWidth = 40;
var playerHeight = 40;
var playerStats;

function Sprite(sheet, x, y, n) {
  this.sheet = sheet;
  this.x = x;
  this.y = y;
  this.h = sheet.height;
  this.w = sheet.width / n;
  this.frame = n;
  this.frames = 4;

  this.draw = function() {
    image(this.sheet, this.x, this.y, this.w, this.h, this.w*floor(this.frame), 0, this.w, this.h);

    this.frame += 0.1;
    if(this.frame > this.frames) {
      this.frame = 0
    }
  }
}

function setupPlayer() {
  // obj thats player, speed can be changed
  playerStats = {
    // the current x and y position that the player spawns at
    // currently in the center where the base will be
    x: width / 2,
    y: width / 2,
    speed: 8
  };
  player = new Sprite(playerSprite, playerStats.x, playerStats.y, 4);
}

// this just draws the player
function drawPlayer() {
  fill(0);
  // circle(playerStats.x, playerStats.y, playerWidth, playerHeight);
  player.x = playerStats.x;
  player.y = playerStats.y;
  player.draw();
}

