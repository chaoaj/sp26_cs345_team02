let playButton;
let settingsButton;
let encycButton;
let titleText;
let titleBg;
let backButton;

let currentScreen = "title";

function setupTitleScreen() {
    playButton = createButton("Play");
    playButton.id("mainMenuButton");
    playButton.position(width / 2 - 15, height / 2 + 30);
    playButton.mousePressed(startGame);

    settingsButton = createButton("Settings");
    settingsButton.id("mainMenuButton");
    settingsButton.position(width / 2 - 20, height / 2 + 80);
    settingsButton.mousePressed(openSettings);

    encycButton = createButton("Encyclopedia");
    encycButton.id("mainMenuButton");
    encycButton.position(width / 2 - 30, height / 2 + 130);
    encycButton.mousePressed(openEncyclopedia);

    backButton = createButton("Back");
    backButton.position(20, 20);
    backButton.mousePressed(goToTitle);
    backButton.hide();
}

function drawTitleScreen() {
    image(titleBg, width / 2, height / 2, width, height);
    image(titleLogo, width / 2, 280, 160 * 5, 120 * 5);
    image(titlePlayButton, width / 2 + 65, height / 2 + 50, 602/4, 235/4);
    image(titleSettingsButton, width / 2 + 50, height / 2 + 100, 602/4, 235/4);
    image(titleEncyclopediaButton, width / 2 + 40, height / 2 + 150, 602/4, 235/4);
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

    var keybinds = [
        ["W", "Axes Up", "Move Up"],
        ["A", "Axes Left", "Move Left"],
        ["S", "Axes Down", "Move Down"],
        ["D", "Axes Right", "Move Right"],
        ["T", "X", "Place Tower"],
        ["1", "DPad Up", "Select Tower 1"], // This task can be marked as complete,
        ["2", "DPad Right", "Select Tower 2"],
        ["3", "DPad Down", "Select Tower 3"],
        ["4", "DPad Left", "Select Tower 4"],
        [">", "Right Axes Right", "Select Next Tower"],
        ["<", "Right Axes Left", "Select Previous Tower"],
        ["P", "Select", "Pause"], // after we add controller functions for each button
        ["R + L-Shift", "R + L Bumper", "Reset Game"]
    ];

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
    for (var i = 0; i < keybinds.length; i++) {
        var y = startY + i * rowHeight;
        text("[" + keybinds[i][0] + "]", keyX, y);
        text("[" + keybinds[i][1] + "]", controlX, y);
        text(keybinds[i][2], actionX, y);
    }
}

function drawEncyclopediaScreen() {
    background(50);
    fill(255);
    textSize(21);
    textAlign(CENTER, CENTER);
    text("Encyclopedia", width / 2, height / 4);

    var encyclist = [
        [towerImages.normal , "Normal Tower", "Standard tower, low health, 0 damage. $50"],
        [towerImages.healing , "Healing Tower", "Heals the player and base +10, low health, 0 damage. $100"],
        [towerImages.attack , "Attack Tower", "Attacks enemies, high health, 30 damage. $200"],
        [towerImages.explosive , "Explosive Tower", "Explodes enemies, high health, 70 damage. $250"]
    ];

    var startY = height / 3;
    var rowHeight = 90;
    var towerImageX = width / 8;
    var towerX = 2 * width / 10;
    var textX = 4 * width / 10;

    textAlign(LEFT);

    for (var i = 0; i < encyclist.length; i++) {
        var y = startY + i * rowHeight;
        image(encyclist[i][0], towerImageX, y);
        text(encyclist[i][1], towerX, y);
        text(encyclist[i][2], textX, y);
    }
}

function hideTitleScreenElements() {
    playButton.hide();
    settingsButton.hide();
    encycButton.hide();
}

function showTitleScreenElements() {
    playButton.show();
    settingsButton.show();
    encycButton.show();
}
