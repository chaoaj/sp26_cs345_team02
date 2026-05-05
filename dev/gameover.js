// ---- Game Stats Tracking ----
var totalEnemiesKilled = 0;
var totalMoneyCollected = 0;
var gameStartFrame = 0;
var frozenTimeSurvived = "";
var highScore = 0;
var hasWonGame = false;

// After this wave completes with the player alive, the win screen is shown
var finalBossWave = 10;

// ---- Fade Transition ----
var fadeAlpha = 0;
var fadeSpeed = 3;
var fadeTarget = "";
var endScreenContentAlpha = 0;

function setupGameStats() {
    totalEnemiesKilled = 0;
    totalMoneyCollected = 0;
    gameStartFrame = frameCount;
    frozenTimeSurvived = "";
    hasWonGame = false;
}

function trackEnemyKill() {
    totalEnemiesKilled++;
    totalMoneyCollected += enemyStats.moneyDropped;
}

function freezeTimeSurvived() {
    var totalSeconds = Math.floor((frameCount - gameStartFrame) / 60);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    frozenTimeSurvived = minutes + "m " + (seconds < 10 ? "0" : "") + seconds + "s";
}

function getTimeSurvived() {
    return frozenTimeSurvived;
}

function getLiveTime() {
    var totalSeconds = Math.floor((frameCount - gameStartFrame) / 60);
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + "m " + (seconds < 10 ? "0" : "") + seconds + "s";
}

function drawLiveTimer() {
    var size = 35;
    fill(255);
    stroke(0);
    strokeWeight(2);
    textSize(size);
    textAlign(RIGHT);
    text(getLiveTime(), width - 20, size + 10);
    noStroke();
}

// ---- End Screen Buttons ----
var gameOverPlayAgainButton;
var winPlayAgainButton;
var winKeepPlayingButton;

function setupEndScreens() {
    gameOverPlayAgainButton = createButton("Play Again");
    gameOverPlayAgainButton.id("endScreenButton");
    gameOverPlayAgainButton.position(width / 2 - 65, height * 0.72);
    gameOverPlayAgainButton.mousePressed(resetGame);
    gameOverPlayAgainButton.hide();

    winPlayAgainButton = createButton("Play Again");
    winPlayAgainButton.id("endScreenButton");
    winPlayAgainButton.position(width / 2 - 65, height * 0.80);
    winPlayAgainButton.mousePressed(resetGame);
    winPlayAgainButton.hide();

    winKeepPlayingButton = createButton("Keep Playing");
    winKeepPlayingButton.id("endScreenButton");
    winKeepPlayingButton.position(width / 2 - 65, height * 0.72);
    winKeepPlayingButton.mousePressed(keepPlaying);
    winKeepPlayingButton.hide();
}

function showGameOver() {
    if (paused) return;
    if (currentScreen === "fading") return;
    if (totalEnemiesKilled > highScore) highScore = totalEnemiesKilled;
    freezeTimeSurvived();
    fadeAlpha = 0;
    endScreenContentAlpha = 0;
    fadeTarget = "gameover";
    currentScreen = "fading";
}

function showWinScreen() {
    if (paused) return;
    if (currentScreen === "fading") return;
    if (totalEnemiesKilled > highScore) highScore = totalEnemiesKilled;
    freezeTimeSurvived();
    fadeAlpha = 0;
    endScreenContentAlpha = 0;
    fadeTarget = "win";
    currentScreen = "fading";
}

function keepPlaying() {
    hideEndScreenButtons();
    gameStartFrame = frameCount - Math.round(parseFrozenTime() * 60);
    currentScreen = "game";
}

function parseFrozenTime() {
    var parts = frozenTimeSurvived.match(/(\d+)m\s*(\d+)s/);
    if (parts) return parseInt(parts[1]) * 60 + parseInt(parts[2]);
    return 0;
}

function hideEndScreenButtons() {
    if (gameOverPlayAgainButton) gameOverPlayAgainButton.hide();
    if (winPlayAgainButton) winPlayAgainButton.hide();
    if (winKeepPlayingButton) winKeepPlayingButton.hide();
}

function drawFadeTransition() {
    // Keep drawing the game scene underneath
    push();
    translate(width / 2 - camera.x, height / 2 - camera.y);
    imageMode(CENTER);
    image(grassBg, 0, 0);
    drawDecorations();
    drawEnemies();
    drawTowers();
    drawExplosives();
    drawArrows();
    drawTroops();
    drawBase();
    drawPlayer();
    pop();

    drawMoney();
    drawWaveNumber();
    drawInventory();

    // Black overlay fading in
    noStroke();
    fill(0, 0, 0, fadeAlpha);
    rectMode(CORNER);
    rect(0, 0, width, height);

    fadeAlpha = min(fadeAlpha + fadeSpeed, 255);

    if (fadeAlpha >= 255) {
        currentScreen = fadeTarget;
        if (fadeTarget === "gameover") {
            gameOverPlayAgainButton.show();
        } else {
            winPlayAgainButton.show();
            winKeepPlayingButton.show();
        }
    }
}

function drawGameOverScreen() {
    background(15, 0, 0);

    endScreenContentAlpha = min(endScreenContentAlpha + 5, 255);
    var a = endScreenContentAlpha;

    noStroke();

    // Title
    fill(220, 40, 40, a);
    textSize(80);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height * 0.2);

    // Stats panel background
    fill(30, 8, 8, a);
    stroke(180, 40, 40, a);
    strokeWeight(2);
    rectMode(CENTER);
    rect(width / 2, height * 0.49, width * 0.78, height * 0.48, 12);
    noStroke();
    rectMode(CORNER);

    var cx = width / 2;
    var sy = height * 0.30;
    var lh = height * 0.073;

    fill(180, 130, 130, a);
    textSize(22);
    textAlign(CENTER, CENTER);
    text("— STATS —", cx, sy);

    fill(255, 255, 255, a);
    textSize(28);
    var labelX = width * 0.2;
    var valueX = width * 0.72;

    textAlign(LEFT, CENTER);
    text("Wave Reached", labelX, sy + lh);
    textAlign(RIGHT, CENTER);
    text(waveNum, valueX, sy + lh);

    textAlign(LEFT, CENTER);
    text("Time Survived", labelX, sy + lh * 2);
    textAlign(RIGHT, CENTER);
    text(getTimeSurvived(), valueX, sy + lh * 2);

    textAlign(LEFT, CENTER);
    text("Enemies Killed", labelX, sy + lh * 3);
    textAlign(RIGHT, CENTER);
    text(totalEnemiesKilled, valueX, sy + lh * 3);

    textAlign(LEFT, CENTER);
    text("Money Collected", labelX, sy + lh * 4);
    textAlign(RIGHT, CENTER);
    text("$" + totalMoneyCollected, valueX, sy + lh * 4);

    fill(255, 200, 50, a);
    textAlign(LEFT, CENTER);
    text("High Score", labelX, sy + lh * 5);
    textAlign(RIGHT, CENTER);
    text(highScore + " kills", valueX, sy + lh * 5);

    textAlign(CENTER, CENTER);
}

function drawWinScreen() {
    background(0, 15, 0);

    endScreenContentAlpha = min(endScreenContentAlpha + 5, 255);
    var a = endScreenContentAlpha;

    noStroke();

    // Title
    fill(80, 220, 80, a);
    textSize(80);
    textAlign(CENTER, CENTER);
    text("YOU WIN!", width / 2, height * 0.18);

    fill(200, 255, 100, a);
    textSize(24);
    text("The final boss has been defeated!", width / 2, height * 0.27);

    // Stats panel background
    fill(8, 30, 8, a);
    stroke(40, 180, 40, a);
    strokeWeight(2);
    rectMode(CENTER);
    rect(width / 2, height * 0.52, width * 0.78, height * 0.44, 12);
    noStroke();
    rectMode(CORNER);

    var cx = width / 2;
    var sy = height * 0.32;
    var lh = height * 0.068;
    var labelX = width * 0.2;
    var valueX = width * 0.72;

    fill(130, 200, 130, a);
    textSize(22);
    textAlign(CENTER, CENTER);
    text("— FINAL STATS —", cx, sy);

    fill(255, 255, 255, a);
    textSize(28);

    textAlign(LEFT, CENTER);
    text("Waves Survived", labelX, sy + lh);
    textAlign(RIGHT, CENTER);
    text(waveNum, valueX, sy + lh);

    textAlign(LEFT, CENTER);
    text("Time Survived", labelX, sy + lh * 2);
    textAlign(RIGHT, CENTER);
    text(getTimeSurvived(), valueX, sy + lh * 2);

    textAlign(LEFT, CENTER);
    text("Enemies Killed", labelX, sy + lh * 3);
    textAlign(RIGHT, CENTER);
    text(totalEnemiesKilled, valueX, sy + lh * 3);

    textAlign(LEFT, CENTER);
    text("Money Collected", labelX, sy + lh * 4);
    textAlign(RIGHT, CENTER);
    text("$" + totalMoneyCollected, valueX, sy + lh * 4);

    fill(255, 220, 50, a);
    textAlign(LEFT, CENTER);
    text("High Score", labelX, sy + lh * 5);
    textAlign(RIGHT, CENTER);
    text(highScore + " kills", valueX, sy + lh * 5);

    textAlign(CENTER, CENTER);
}
