// spritesheet is 710 x 90, 8 frames. each frame is 90 x 90

var playerWidth = 40;
var playerHeight = 40;
var playerStats;

function Sprite(sheet, x, y, n) {
  this.sheet = sheet;
  this.x = x;
  this.y = y;
  this.h = sheet.height;
  this.w = sheet.width / 8;
  this.frame = n;
  this.frames = 8;

  this.drawPlayer = function() {
    image(this.sheet, this.x, this.y, this.w, this.h, this.w*floor(this.frame), 0, this.w, this.h);

    if (playerStats.facing == "RIGHT") { // if right key is pressed,
      if (this.frame > 7.9) {
        this.frame = 4; // play frames 5 to 8
      }
    } else if (playerStats.facing == "LEFT") {
      if (this.frame > 3.9) { // else play frames 1 to 4
        this.frame = 0;
      }
    }
    if (paused) {
      this.frame = 0;
    }
    
    this.frame += 0.1;

   // below is just a regular animation cycle. can copy for enemies
   // this.frame += 0.1;
   // if(this.frame > this.frames) {
    //  this.frame = 0
  //  }
  }
}

function setupPlayer() {
  // obj thats player, speed can be changed
  playerStats = {
    // the current x and y position that the player spawns at
    // currently in the center where the base will be
    x: width / 2,
    y: width / 2,
    speed: 8,
    health: 100,
    maxHealth: 100,
    facing: "LEFT"
  };
  player = new Sprite(playerSprite, playerStats.x, playerStats.y, 8);
}

function checkPlayerCollisions() {
  for (var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];
      var d1 = dist(enemy.x, enemy.y, playerStats.x, playerStats.y + 25);
      var d2 = dist(enemy.x, enemy.y, playerStats.x, playerStats.y - 25);
      var d3 = dist(enemy.x, enemy.y, playerStats.x, playerStats.y);
      var collisionDist = enemy.size / 2 + playerWidth / 2;
      if (d1 < collisionDist || d2 < collisionDist || d3 < collisionDist) {
          playerStats.health -= damageConfig.enemyToPlayer;
          enemies.splice(i, 1);
      }
  }
}

// just checks the health and restarts the game if it ever hits 0.
function CheckHealth() {
  if (playerStats.health <= 0) {
    resetGame();
  }
}

// this just draws the player
function drawPlayer() {
  fill(0);
  // circle(playerStats.x, playerStats.y, playerWidth, playerHeight);
  player.x = playerStats.x;
  player.y = playerStats.y;
  player.drawPlayer();
  drawHealthBar(constrain(playerStats.x, 40, width - 40), constrain(playerStats.y, 50, height), 80, playerStats.health, playerStats.maxHealth);
}
