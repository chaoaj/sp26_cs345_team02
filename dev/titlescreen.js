let playButton;
let titleText;
// let settingsButton;
// let encycButton;

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
    fill(0);
    textSize(24);
    textAlign(CENTER);
}

function startGame() { // Removes title elements
    playButton.remove();
    background(0); // Will later be the next screen
    // disable this script after?
    titleText.remove();
}

function draw() {
    text(titleText, width / 2, height / 4);
}

/*
function showImage(src, width) {
    let img = document.createElement("img");
    img.src = src;
    img.width = width;
    document.body.appendChild(img);
}
*/