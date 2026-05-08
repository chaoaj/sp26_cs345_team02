/**
 * Simple in-game pause menu.
 *
 * State machine:
 *   pauseMenuTab === null         — main pause screen (two big buttons)
 *   pauseMenuTab === "keybinds"   — keybinds table view
 *   pauseMenuTab === "towers"     — tower types view
 *
 * Drawing and click hit-testing both call pauseMenuButtonRects() so layout
 * stays in one place. To redesign visuals, change pauseMenuLayout below
 * or replace the bodies of drawPauseMenuButton / drawPauseMenuKeybinds /
 * drawPauseMenuTowers — none of the click logic needs to move.
 */

var pauseMenuTab = null;
var pauseSelectedIndex = null;

// Single source of truth for keybind documentation.
// Format: [keyboard, controller, action]
var keybindsList = [
    ["W", "Axes Up", "Move Up"],
    ["A", "Axes Left", "Move Left"],
    ["S", "Axes Down", "Move Down"],
    ["D", "Axes Right", "Move Right"],
    ["T", "X", "Place Tower"],
    ["1", "DPad Up", "Select Tower 1"],
    ["2", "DPad Right", "Select Tower 2"],
    ["3", "DPad Down", "Select Tower 3"],
    ["4", "DPad Left", "Select Tower 4"],
    [">", "Right Axes Right", "Select Next Tower"],
    ["<", "Right Axes Left", "Select Previous Tower"],
    ["P", "Select", "Pause"],
    ["R + L-Shift", "R + L Bumper", "Reset Game"],
    ["Q", "B", "Sell Tower"],
    ["U", "Y", "Upgrade Tower"]
];

// Format: [imageKey, name, description]
var towerInfoList = [
    ["normal",    "Normal Tower",    "Fires arrows at approaching enemies from a distance."],
    ["healing",   "Healing Tower",   "Restores health to nearby allies. Prioritizes the player, then the base, then combat towers."],
    ["attack",    "Attack Tower",    "Deploys troops that chase and engage enemies in melee combat."],
    ["explosive", "Explosive Tower", "Launches explosive projectiles that deal area damage on impact."]
];

// Layout constants — tweak these to redesign without touching state logic.
var pauseMenuLayout = {
    panelW: 600,
    panelH: 800,
    panelRadius: 12,
    titleSize: 32,
    titleY: 110,
    btnW: 240,
    btnH: 90,
    btnGap: 30,
    backW: 110,
    backH: 50
};

function pauseMenuOrigin() {
    return {
        x: (width - pauseMenuLayout.panelW) / 2,
        y: (height - pauseMenuLayout.panelH) / 2
    };
}

// Returns the rects for every clickable button on the current tab.
// Both drawPauseMenu and handlePauseMenuClick read from this so they stay in sync.
function pauseMenuButtonRects() {
    var origin = pauseMenuOrigin();
    var L = pauseMenuLayout;
    var rects = {};

    if (pauseMenuTab === null) {
        var btnX = origin.x + (L.panelW - L.btnW) / 2;
        var btnY1 = origin.y + 280;
        var btnY2 = btnY1 + L.btnH + L.btnGap;
        rects.keybinds = { x: btnX, y: btnY1, w: L.btnW, h: L.btnH, label: "Keybinds" };
        rects.towers   = { x: btnX, y: btnY2, w: L.btnW, h: L.btnH, label: "Tower Types" };
    } else {
        rects.back = {
            x: origin.x + 30, y: origin.y + 30,
            w: L.backW, h: L.backH, label: "< Back"
        };
    }
    return rects;
}

function drawPauseMenu(title) {
    if (title === undefined) title = "PAUSED";
    var L = pauseMenuLayout;
    var origin = pauseMenuOrigin();

    push();

    // dim the game world
    rectMode(CORNER);
    noStroke();
    fill(0, 180);
    rect(0, 0, width, height);

    // panel background
    fill(30, 30, 30, 230);
    stroke(180);
    strokeWeight(2);
    rect(origin.x, origin.y, L.panelW, L.panelH, L.panelRadius);
    noStroke();

    // title
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(L.titleSize);
    text(title, origin.x + L.panelW / 2, origin.y + L.titleY);

    // tab content
    if (pauseMenuTab === "keybinds") {
        drawPauseMenuKeybinds(origin);
    } else if (pauseMenuTab === "towers") {
        drawPauseMenuTowers(origin);
    } else if (paused) {
        drawPauseMenuFooter(origin);
    }

    // buttons drawn last so they sit on top
    var rects = pauseMenuButtonRects();
    var keys = Object.keys(rects);
    keys.forEach((key, i) => drawPauseMenuButton(rects[key], i === pauseSelectedIndex));

    pop();
}

function drawPauseMenuFooter(origin) {
    var L = pauseMenuLayout;
    fill(180);
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Press P to resume",
         origin.x + L.panelW / 2,
         origin.y + L.panelH - 60);
}

function drawPauseMenuButton(box, isSelected = null) {
    push();
    rectMode(CORNER);
    fill(60);
    if (isSelected != null) {
        stroke(isSelected ? color(255, 217, 10) : 180);
        strokeWeight(isSelected ? 3 : 2);
    }
    rect(box.x, box.y, box.w, box.h, 8);
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(box.h > 70 ? 26 : 18);
    text(box.label, box.x + box.w / 2, box.y + box.h / 2);
    pop();
}

function drawPauseMenuKeybinds(origin) {
    var L = pauseMenuLayout;
    var startY = origin.y + 220;
    var rowH = 36;
    var keyX = origin.x + 60;
    var ctrlX = origin.x + L.panelW * 0.40;
    var actX = origin.x + L.panelW * 0.65;

    fill(180);
    textAlign(LEFT, CENTER);
    textSize(18);
    text("Keyboard", keyX, startY - 30);
    text("Controller", ctrlX, startY - 30);
    text("Action", actX, startY - 30);

    fill(255);
    textSize(15);
    for (var i = 0; i < keybindsList.length; i++) {
        var y = startY + i * rowH;
        text("[" + keybindsList[i][0] + "]", keyX, y);
        text("[" + keybindsList[i][1] + "]", ctrlX, y);
        text(keybindsList[i][2], actX, y);
    }
}

function drawPauseMenuTowers(origin) {
    var L = pauseMenuLayout;
    var startY = origin.y + 220;
    var rowH = 140;
    var imgX = origin.x + 90;
    var nameX = origin.x + 180;
    var descX = origin.x + 180;
    var descW = L.panelW - 220;

    push();
    imageMode(CENTER);
    for (var i = 0; i < towerInfoList.length; i++) {
        var entry = towerInfoList[i];
        var img = towerImages[entry[0]];
        var y = startY + i * rowH;

        if (img) image(img, imgX, y + 50, 80, 80);

        fill(255);
        textAlign(LEFT, TOP);
        textSize(22);
        textStyle(BOLD);
        text(entry[1], nameX, y + 10);
        textStyle(NORMAL);
        textSize(15);
        fill(220);
        text(entry[2], descX, y + 45, descW, rowH - 50);
    }
    pop();
}

function handlePauseMenuClick(mx, my) {
    var rects = pauseMenuButtonRects();
    for (var key in rects) {
        var b = rects[key];
        if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
            if (key === "keybinds")    pauseMenuTab = "keybinds";
            else if (key === "towers") pauseMenuTab = "towers";
            else if (key === "back")   pauseMenuTab = null;
            return true;
        }
    }
    return false;
}
