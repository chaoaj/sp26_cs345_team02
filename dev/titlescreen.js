let playButton;
let settingsButton;
let encycButton;
let titleText;
let titleBg;
let backButton;

let currentScreen = "title";

let muteButton;
let isMuted = false;

function setupTitleScreen() {
    playButton = createButton("Play");
    playButton.id("mainMenuButton");
    playButton.position(width / 2 - 35, height / 2 + 95);
    playButton.mousePressed(startGame);

    settingsButton = createButton("Settings");
    settingsButton.id("mainMenuButton");
    settingsButton.position(width / 2 - 35, height / 2 + 155);
    settingsButton.mousePressed(openSettings);

    encycButton = createButton("Encyclopedia");
    encycButton.id("mainMenuButton");
    encycButton.position(width / 2 - 35, height / 2 + 215);
    encycButton.mousePressed(openEncyclopedia);

    nextButton = createButton("Next");
    nextButton.position(width - 20 - nextButton.width, 20);
    nextButton.mousePressed(encyclopediaNext);
    nextButton.hide();

    backButton = createButton("Back to Menu");
    backButton.position(20, 20);
    backButton.mousePressed(goToTitle);
    backButton.hide();

    muteButton = createButton("Mute Music");
    muteButton.id("muteButton");
    muteButton.position(20, height - 60);
    muteButton.mousePressed(toggleMute);
}

function drawTitleScreen() {
    image(titleBg, width / 2, height / 2, width, height);
    image(titleLogo, width / 2, 220, 160 * 4.2, 120 * 4.2);
    image(titlePlayButton, width / 2 + 50, height / 2 + 120, 602/3.7, 235/3.7);
    image(titleSettingsButton, width / 2 + 50, height / 2 + 180, 602/4, 235/4);
    image(titleEncyclopediaButton, width / 2 + 50, height / 2 + 240, 602/4, 235/4);
    //fill(0);
    //textSize(24);
    //textAlign(CENTER, CENTER);
}

function startGame() {
    hideTitleScreenElements();
    playMenuClickSound();
    menuMusic.pause();
    menuMusic.currentTime = 0;
    
    if (gameBackgroundMusic.paused) {
        gameBackgroundMusic.currentTime = 0;
        gameBackgroundMusic.play();
    }
    
    currentScreen = "game";
    menuMusic.volume = 0;
    setupGameStats();
}

function openSettings() {
    playMenuClickSound();
    hideTitleScreenElements();
    currentScreen = "settings";
    backButton.show();
}

function openEncyclopedia() {
    playMenuClickSound();
    hideTitleScreenElements();
    currentScreen = "story";
    backButton.show();
    nextButton.show();
}

function encyclopediaNext() {
    playMenuClickSound();
    if (currentScreen == "story") {
        currentScreen = "encyclopedia";
    } else if (currentScreen == "encyclopedia") {
        currentScreen = "enemies";
    } else if (currentScreen == "enemies") {
        currentScreen = "story";
    }
}

function goToTitle() {
    playMenuClickSound();

    gameBackgroundMusic.pause();
    gameBackgroundMusic.currentTime = 0;

    if (menuMusic.paused && !isMuted) {
        menuMusic.play();
    }

    backButton.hide();
    nextButton.hide();
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
    textAlign(CENTER, CENTER);
    var startY = 150;
    var rowHeight = 36;
    var keyX = width * 0.25
    var controlX = width * 0.5;
    var actionX = width * 0.75;

    fill(180);
    textAlign(CENTER, CENTER);
    text("Keyboard", keyX, 120);

    textAlign(CENTER, CENTER);
    text("Controller", controlX, 120);

    textAlign(CENTER, CENTER);
    text("Action", actionX, 120);

    fill(255);
    for (var i = 0; i < keybindsList.length; i++) {
        var y = startY + i * rowHeight;
        text("[" + keybindsList[i][0] + "]", keyX, y);
        text("[" + keybindsList[i][1] + "]", controlX, y);
        text(keybindsList[i][2], actionX, y);
    }
}

function drawStoryScreen() {
    push();
    background(50);
    fill(255);
    textSize(25);
    textAlign(CENTER, TOP);
    text("Story of FrontGuard", width / 2, height / 4);
    textSize(22);
    textWrap(WORD);
    textAlign(CENTER,)
    textLeading(30);
    text("You never wanted to be a knight. Growing up, while other children played in grass-filled fields with imaginary swords fashioned "
        + "from the biggest sticks they could find, you immersed yourself in your studies and created slingshots from twigs and wool scraps.\n\nAs "
        + "you got older, you continued to study, developing an interest in engineering complex contraptions to help the people around you. After "
        + "years of hard work and refining your ideas, King Jamesworth Madisyn took notice of your dedication. After some convincing, he decided "
        + "to give you the opportunity to redesign the kingdom's defenses from the ground up.\n\nYou were granted oversight over a small team to "
        + "help you carry out manual labor. With your new group of subordinates, the "
        + "old defenses are torn down, and you can almost see your new designs standing amongst the piles of rubble. However, before you could "
        + "start constructing the defenses, the king notified you that one of his generals orchestrated a failed surprise attack on "
        + "a neighboring kingdom. The neighboring kingdom is sure to respond, and soon. There is no longer time to spare.\n\n"
        + "Can you protect the kingdom?",
        width / 8, height / 3, 3 * width / 4);
    text("1/3", width - 60, height - 30);
    pop();
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
    text("2/3", width - 75, height - 30);
}

function drawEnemyScreen() {
    background(50);
    fill(255);
    textAlign(CENTER, CENTER);

    let y = 80;   // starting Y position
    let gap = 18; // spacing control

    // TITLE
    textSize(26);
    text("Enemy Encyclopedia", width / 2, y);
    textSize(14);
    text("3 / 3 Pages", width - 80, 30);

    // ================= NORMAL ENEMY =================
    y += 90;
    textSize(18);
    text("Normal Enemy", width / 2, y);

    image(enemySprite, width / 2, y + 60, 70, 70);

    textSize(14);
    text("HP: 60 × wave level", width / 2, y + 130);
    text("Speed: 2", width / 2, y + 130 + gap);
    text("Reward: scales from $15+", width / 2, y + 130 + gap * 2);

    // ================= SPECIAL ENEMY =================
    y += 220;
    textSize(18);
    text("Special Enemy", width / 2, y);

    image(enemySpecialSprite, width / 2, y + 60, 70, 70);

    textSize(14);
    text("HP: Higher than normal", width / 2, y + 130);
    text("Speed: 3", width / 2, y + 130 + gap);
    text("Reward: scales from $70+", width / 2, y + 130 + gap * 2);

    // ================= FINAL BOSS =================
    y += 220;
    textSize(18);
    text("FINAL BOSS", width / 2, y);

    textSize(14);
    text("HP: Very High", width / 2, y + 60);
    text("Speed: Slow", width / 2, y + 60 + gap);
    text("Reward: Highest in game", width / 2, y + 60 + gap * 2);
}

function hideTitleScreenElements() {
    playButton.hide();
    settingsButton.hide();
    encycButton.hide();
    muteButton.hide();
}

function showTitleScreenElements() {
    playButton.show();
    settingsButton.show();
    encycButton.show();
    muteButton.show();
}

function toggleMute() {
    playMenuClickSound();

    isMuted = !isMuted;

    if (isMuted) {
        menuMusic.volume = 0;
        gameBackgroundMusic.volume = 0;

        muteButton.html("Unmute Music");
    } else {
        menuMusic.volume = 0.5;
        gameBackgroundMusic.volume = 0.5;

        if (currentScreen == "title") {
            if (menuMusic.paused) menuMusic.play();
        } else if (currentScreen == "game") {
            if (gameBackgroundMusic.paused) {
                gameBackgroundMusic.play();
            }
        }
        muteButton.html("Mute Music");
    }
}

function playMenuClickSound() {
    let click = new Audio("audio/menu_click.wav");

    click.volume = 1;

    click.play()
}