let playButton;
// let settingsButton;
// let encycButton;

function preload() {
    title = loadImage("images/PlaceholderBG.png");
    logo = loadImage("images/FrontGuardTitle.png");
}

function setup() {
    background(title);
    document.getElementById(logo);
    playButton = createButton("Play");
    playButton.mousePressed(startGame);
    playButton.position(200, 200);
}

function startGame() {
    playButton.remove();
    title.remove();
}