let playButton;
let titleText;
let settingsButton;
let encycButton;
let currentScreen = "title";

function preload() {
    title = loadImage("images/PlaceholderBG.png"); // Background image for title screen
    title.width = 400;
    title.height = 400;
    titleText = "FrontGuard"; // I spent way too long trying to display the actual logo image
    // I'm just gonna use text for now...

}

function setup() {
    createCanvas(400, 400);
    background(title);

    playButton = createButton("Play");
    playButton.mousePressed(startGame);
    playButton.position(width / 2, height / 2);

    settingsButton = createButton("Settings");
    settingsButton.position(width / 2, height / 2 + 40);
    settingsButton.mousePressed(openSettings);

    encycButton = createButton("Encyclopedia");
    encycButton.position(width / 2, height / 2 + 80);
    encycButton.mousePressed(openEncyclopedia);

    fill(0);
    textSize(24);
    textAlign(CENTER);
}

function startGame() {
    playButton.remove();
    settingsButton.remove();
    encycButton.remove();
    currentScreen = "game";
    
    // this is where the main should start
    background(0);
}


function draw() {
    if (currentScreen === "title") {
        text(titleText, width / 2, height / 4);
    }
    // other screens are static so theres no need to redraw

}

/*
function showImage(src, width) {
    let img = document.createElement("img");
    img.src = src;
    img.width = width;
    document.body.appendChild(img);
}
*/

// Placeholder for open settings.
function openSettings() {
    playButton.hide();
    settingsButton.hide();
    encycButton.hide();
    currentScreen = "settings";
    background(50);
    fill(255);
    text("Settings", width / 2, height / 4);
}

// Placeholder for open encyclopedia.
function openEncyclopedia() {
    playButton.hide();
    settingsButton.hide();
    encycButton.hide();
    currentScreen = "encyclopedia";
    background(50);
    fill(255);
    text("Encyclopedia", width / 2, height / 4);
}