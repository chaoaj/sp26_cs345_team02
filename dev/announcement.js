var announcement;
var showAnnouncement = false;

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
        this.maxTime = prepTimeFrames;
        this.text = text;
        this.size = size;
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
        textAlign(CENTER);
        textSize(this.size);
        textFont(textFonts.nunito);
        fill(0, 120);
        rect(this.bbox.x - 10, this.bbox.y - 10, this.bbox.w + 20, this.bbox.h + 20);
        fill(255, 255);
        text(this.text, width / 2, height - 100);
        // remove this announcement if it is older than maxTime
        if (frameCount - this.frame >= this.maxTime && !paused) {
            showAnnouncement = !showAnnouncement;
        }
        pop();
    }
}