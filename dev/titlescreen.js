let playButton;
let settingsButton;
let encycButton;
let titleText;
let titleBg;

let currentScreen = "title";

function setupTitleScreen() {
    playButton = createButton("Play");
    playButton.position(width / 2 - 20, height / 2 + 40);
    playButton.mousePressed(startGame);

    settingsButton = createButton("Settings");
    settingsButton.position(width / 2 - 30, height / 2 + 70);
    settingsButton.mousePressed(openSettings);

    encycButton = createButton("Encyclopedia");
    encycButton.position(width / 2 - 43, height / 2 + 100);
    encycButton.mousePressed(openEncyclopedia);
}

function drawTitleScreen() {
    image(titleBg, width / 2, height / 2, width, height);

    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    image(titleLogo, width / 2, 120, 160 * 2, 120 * 2);
}

function startGame() {
    hideTitleScreenElements();
    currentScreen = "game";
}

// Placeholder for open settings.
function openSettings() {
    hideTitleScreenElements();
    currentScreen = "settings";
}

// Placeholder for open encyclopedia.
function openEncyclopedia() {
    hideTitleScreenElements();
    currentScreen = "encyclopedia";
}


function drawSettingsScreen() {
    background(50);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Settings", width / 2, height / 4);
}

function drawEncyclopediaScreen() {
    background(50);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Encyclopedia", width / 2, height / 4);
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