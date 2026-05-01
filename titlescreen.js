let playButton;
let settingsButton;
let encycButton;
let titleText;
let titleBg;
let backButton;
//let muteButton;

let currentScreen = "title";

//let musicIsMuted = false;

function setupTitleScreen() {
    playButton = createButton("Play");
    playButton.id("mainMenuButton");
    playButton.position(width / 2 - 10, height / 2 + 70);
    playButton.mousePressed(startGame);

    settingsButton = createButton("Settings");
    settingsButton.id("mainMenuButton");
    settingsButton.position(width / 2 - 10, height / 2 + 120);
    settingsButton.mousePressed(openSettings);

    encycButton = createButton("Encyclopedia");
    encycButton.id("mainMenuButton");
    encycButton.position(width / 2 - 10, height / 2 + 170);
    encycButton.mousePressed(openEncyclopedia);

    backButton = createButton("Back");
    backButton.position(20, 20);
    backButton.mousePressed(goToTitle);
    backButton.hide();

    /*
    muteButton = createButton("Mute Music");
    muteButton.id("muteButton");
    muteButton.position(20, height - 60);
    muteButton.mousePressed(musicToggle);
    */
}

function drawTitleScreen() {
    image(titleBg, width / 2, height / 2, width, height);
    image(titleLogo, width / 2, 280, 160 * 4.2, 120 * 4.2);
    image(titlePlayButton, width / 2 + 50, height / 2 + 90, 602/3.7, 235/3.7);
    image(titleSettingsButton, width / 2 + 50, height / 2 + 140, 602/4, 235/4);
    image(titleEncyclopediaButton, width / 2 + 50, height / 2 + 190, 602/4, 235/4);

    menuMusic.play();
    //fill(0);
    //textSize(24);
    //textAlign(CENTER, CENTER);
}

function startGame() {
    hideTitleScreenElements();
    //titleBg.remove();
    currentScreen = "game";
}

function openSettings() {
    hideTitleScreenElements();
    currentScreen = "settings";
    backButton.show();
}

function openEncyclopedia() {
    hideTitleScreenElements();
    currentScreen = "encyclopedia";
    backButton.show();
}

function goToTitle() {
    backButton.hide();
    currentScreen = "title";
    showTitleScreenElements();
}


function drawSettingsScreen() {
    background(50);
    fill(255);
    textAlign(CENTER, CENTER);

    textSize(28);
    text("Settings", width / 2, 80);

    textSize(16);
    textAlign(LEFT, CENTER);
    var startY = 260;
    var rowHeight = 36;
    var keyX = width / 2 - 150;
    var controlX = width / 2;
    var actionX = width / 2 + 150;

    fill(180);
    text("Keyboard", keyX, 160);
    text("Controller", controlX, 160);
    text("Action", actionX, 160);

    fill(255);
    for (var i = 0; i < keybindsList.length; i++) {
        var y = startY + i * rowHeight;
        text("[" + keybindsList[i][0] + "]", keyX, y);
        text("[" + keybindsList[i][1] + "]", controlX, y);
        text(keybindsList[i][2], actionX, y);
    }
}

function drawEncyclopediaScreen() {
    background(50);
    fill(255);
    textSize(21);
    textAlign(CENTER, CENTER);
    text("Encyclopedia", width / 2, height / 4);

    var startY = height / 3;
    var rowHeight = 90;
    var towerImageX = width / 8;
    var towerX = 2 * width / 10;
    var textX = 4 * width / 10;

    textAlign(LEFT);

    for (var i = 0; i < towerInfoList.length; i++) {
        var entry = towerInfoList[i];
        var y = startY + i * rowHeight;
        image(towerImages[entry[0]], towerImageX, y);
        text(entry[1], towerX, y);
        text(entry[2], textX, y);
    }
}

function hideTitleScreenElements() {
    playButton.hide();
    settingsButton.hide();
    encycButton.hide();
    //muteButton.hide();
    menuMusic.pause();
}

function showTitleScreenElements() {
    playButton.show();
    settingsButton.show();
    encycButton.show();
    //muteButton.show();
}

/*
function musicToggle() {
    if (menuMusic.isPlaying()) {
        menuMusic.pause();
        muteButton.html("Play Music");
    } else {
        menuMusic.play();
        muteButton.html("Pause Music");
    }
}
*/