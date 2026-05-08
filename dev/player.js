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

  this.drawBase = function() {
    this.frames = 2;
    this.w = sheet.width / this.frames;
    image(this.sheet, this.x, this.y, this.w * 2, this.h * 2, this.w*floor(this.frame), 0, this.w, this.h);

    this.frame += 0.1;
    if (this.frame > this.frames) {
      this.frame = 0;
    }

    if (paused) {
      this.frame = 0;
    }
  }

  this.drawEnemy = function(sizeInc = 1) {
    this.frames = 4;
    this.w = sheet.width / this.frames;
    image(this.sheet, this.x, this.y, this.w * sizeInc, this.h * sizeInc, this.w*floor(this.frame), 0, this.w, this.h);

    this.frame += 0.1;
    if (this.frame > this.frames) {
      this.frame = 0;
    }
  }
}

function setupPlayer() {
  // obj thats player, speed can be changed
  playerStats = {
    // the current x and y position that the player spawns at
    // currently in the center where the base will be
    x: 0,
    y: 0,
    speed: 8,
    health: 100,
    maxHealth: 100,
    facing: "LEFT",
    money: 200
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

          if (frameCount - lastPlayerHitSoundFrame > 10) {
            let playerHit = new Audio(playerHitSound.src);

            playerHit.volume = 0.4;
            playerHit.play();

            lastPlayerHitSoundFrame = frameCount;
          }
          enemyKilled(i, null);
      }
  }
}

// function controlling text which appears whenever an enemy is killed
function moneyAnimation() {
  var animationFrames = 75;
  for (i = 0; i < killedEnemies.length; i++) {
      var framesPassed = 1 + frameCount - killedEnemies[i].frame;
      if (framesPassed > animationFrames) {
          killedEnemies.splice(i, 1)
      } else {
          // handles the actual animation for specific enemies
          textAlign(CENTER);
          var alpha = 255 - framesPassed * (255 / animationFrames);
          stroke(0, 0, 0, alpha);
          strokeWeight(3);
          fill(0, 250, 24, alpha);
          textSize(20 - framesPassed * (10 / animationFrames));

          let screenX = killedEnemies[i].x - camera.x + width / 2 + killedEnemies[i].ox;
          let screenY = killedEnemies[i].y - camera.y + height / 2 + killedEnemies[i].oy;
          text("+" + killedEnemies[i].money, screenX, screenY);
          noStroke();
      }
  }
}

// display the money the player has
function drawMoney() {
  var size = 35;
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(size);
  textAlign(LEFT);
  text("Money: " + playerStats.money, 20, height - size);
  noStroke();
}

// checks the health and restarts the game if it ever hits 0.
function CheckHealth() {
  if (playerStats.health <= 0) {
    showGameOver();
  }
}

// this just draws the player
function drawPlayer() {
  fill(0);
  // circle(playerStats.x, playerStats.y, playerWidth, playerHeight);
  player.x = playerStats.x;
  player.y = playerStats.y;
  player.drawPlayer();
  drawHealthBar(
    playerStats.x,
    playerStats.y,
    80,
    playerStats.health,
    playerStats.maxHealth);
}
