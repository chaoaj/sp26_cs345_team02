let playButton;
let settingsButton;
let encycButton;
let titleText;
let titleBg;
let backButton;

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

    backButton = createButton("Back");
    backButton.position(20, 20);
    backButton.mousePressed(goToTitle);
    backButton.hide();
}

function drawTitleScreen() {
    image(titleBg, width / 2, height / 2, width, height);
    image(titleLogo, width / 2, 280, 160 * 5, 120 * 5);
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
        ["1-4", "MISSING FUNCTIONALITY", "Select Tower"], // This task can be marked as complete,
        ["P", "MISSING FUNCTIONALITY", "Pause"], // after we add controller functions for each button
        ["R + L-Shift", "MISSING FUNCTIONALITY", "Reset Game"]
    ];

    textSize(16);
    textAlign(LEFT, CENTER);
    var startY = 260;
    var rowHeight = 36;
    var keyX = width / 2 - 120;
    var controlX = width / 2;
    var actionX = width / 2 + 120;

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
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Encyclopedia", width / 2, height / 4);

    var encyclist = [
        ["Normal Tower", "text"],
        ["Healing Tower", "text"],
        ["Attack Tower", "text"],
        ["Explosive Tower", "text"]
    ];
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