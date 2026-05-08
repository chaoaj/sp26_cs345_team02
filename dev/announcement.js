var announcement;
var showAnnouncement = false;

var placedTowers = 0;
var maxTowers = 16;

/** Display text to the user on the bottom center of the screen.
 *
 * - Text should exist within a semi-translucent text box with a pre-defined width and max/min height.
 * - In the future, text could have an animation as it appears
 */
class Announcement {
    /**
     * @param {*} text The text to be displayed
     * @param {*} size The text size to display text at
     */
    constructor(text, size = 32) {
        this.frame = frameCount;
        this.maxTime = 300;
        this.text = text;
        this.size = size;
        this.opacity = 0;
        this.increment = 0.05;
        push();
        textAlign(CENTER);
        this.bbox = textFonts.nunito.textBounds(this.text, width / 2 , height - 100, size);
        pop();
    }

    /**
     * Handle the creation of announcements to the player.
     */
    show() {
        push();
        if (frameCount - this.frame < this.maxTime && this.opacity < 1) {
            this.opacity += this.increment;
        }
        textAlign(CENTER);
        textSize(this.size);
        textFont(textFonts.nunito);

        if (!this.bbox) {
            this.bbox = textFonts.nunito.textBounds(this.text, width / 2, height - 100, this.size);
        }
        fill(0, 120 * this.opacity);
        rect(this.bbox.x - 10, this.bbox.y - 10, this.bbox.w + 20, this.bbox.h + 20);
        fill(255, 255 * this.opacity);
        text(this.text, width / 2, height - 100);
        // remove this announcement if it is older than maxTime
        if (frameCount - this.frame >= this.maxTime && !paused) {
            this.hide();
        }
        pop();
    }

    hide() {
        if (this.opacity <= 0) {
            this.opacity = 0;
            showAnnouncement = !showAnnouncement;
        } else {
            this.opacity -= this.increment;
        }
    }
}

class TowerHUD {
    constructor() {
        this.padding = 10;
        this.size = 24;
    }

    show() {
        push();
        textFont(textFonts.nunito);
        textSize(this.size);
        textAlign(LEFT);

        let label = "Towers: " + towers.length + " / " + effectiveMaxTowers();
        let bbox = textFonts.nunito.textBounds(label, 20, 130, this.size);

        fill(0, 120);
        rect(
            bbox.x - this.padding,
            bbox.y - this.padding,
            bbox.w + this.padding * 2,
            bbox.h + this.padding * 2
        );

        fill(255);
        text(label, 20, 130);
        pop();
    }
}

var towerHUD = new TowerHUD();


function onTowerPlaced() {
    placedTowers++;
}

function onTowerRemoved() {
    placedTowers--;
}

/**
 * Call at the start of each wave with the new tower cap.
 *
 * @param {number} newMax
 */
function updateMaxTowers(newMax) {
    if (newMax > maxTowers) {
        maxTowers = newMax;
        announcement = new Announcement(`Tower limit increased to ${maxTowers}!`, 32);
        showAnnouncement = true;
    }
}
