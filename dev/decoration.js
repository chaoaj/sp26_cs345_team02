// create a decoration class that pushes to a decorations array.

// list of all decoration objects currently being drawn
var decorations = [];

// minimum and maximum amount of decorations that will be spawned on the screen
var minDecorations = 30;
var maxDecorations = 60;

var decorationCollisionDist = 40; //px

function spawnDecorations() {
    // pick a random number to be the amount of decorations placed
    // get a random position on the background
    // check if the position would collide with an already placed decoration
    // if so, attempt to repick location.
    // else, push to the decorations array
    // repeat until we have the correct number of decorations
    decorations = []; 
    var numDecorations = Math.floor(random() * (maxDecorations - minDecorations) + minDecorations);
    console.log("Num Decorations: ", numDecorations);
    for (var i = 0; i < numDecorations; i++) {
        // decides the type of decoration to be spawned
        var type;
        var num = random() * 10;
        if (num >= 4) {
            type = "BUSH";
        } else {
            type = "ROCK";
        }
        
        // decides location of the spawned decoration
        var location = {};
        
        
        location.x = Math.floor(random() * WORLD_SIZE + -WORLD_SIZE / 2); // change to be between 0 and the screen width or whatever
        location.y = Math.floor(random() * WORLD_SIZE + -WORLD_SIZE / 2);
        var item = new Decoration(location.x, location.y, type, getDecorationOffset(), getDecorationOffset(), getDecorationOffset(), getDecorationOffset());
        for (var j = 0; j < decorations.length; j++) {
            if (item.overlapsDecoration(decorations[j]) || item.overlapsBase()) {
                location.x = Math.floor(random() * WORLD_SIZE + -WORLD_SIZE / 2);
                location.y = Math.floor(random() * WORLD_SIZE + -WORLD_SIZE / 2);
                item = new Decoration(location.x, location.y, type, getDecorationOffset(), getDecorationOffset(), getDecorationOffset(), getDecorationOffset());
            }
        }
        decorations.push(item);
    }
    console.log("Decorations Length: ", decorations.length);

}

function drawDecorations() {
    if (decorations == null) console.error("decorations is empty");
    for (var i = 0; i < decorations.length; i++) {
        decorations[i].draw();
    }
}

function getDecorationOffset() {
    return 10 * (random() - 0.5);
}

/**
 * 
 */
class Decoration {
    /**
     * @param {*} x x position of the placed decoration
     * @param {*} y y position of the placed decoration
     * @param {*} type the type of decoration placed (in case of multiple types)
     */
    constructor(x, y, type, offset1, offset2, offset3, offset4) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.offset1 = offset1;
        this.offset2 = offset2;
        this.offset3 = offset3;
        this.offset4 = offset4;
    }

    /**
     * Determine if a Decoration object is overlapping another Decoration object.
     * @param {*} other other Decoration object to check against
     * @returns 
     */
    overlapsDecoration(other) {
        if (!other instanceof Decoration) return false;
        var d = dist(this.x, this.y, other.x, other.y);
        if (d < decorationCollisionDist) {
            return true;
        }
        return false;
    }

    overlapsBase() {
        var d = dist(this.x, this.y, base.x, base.y);
        if (d < decorationCollisionDist * 9) {
            return true;
        }
        return false;
    }

    /**
     * Draw decorations pushed to the decorations array.
     * - decorations are drawn differently depending on their type
     */
    draw() {
        if (this.type == "ROCK") {
            push();
            noStroke();
            fill(112, 112, 112);
            circle(this.x, this.y - 10, 30);
            pop()
        }
        if (this.type == "BUSH") {
            push();
            noStroke();
            fill(54, 99, 41);
            circle(this.x + this.offset1, this.y + this.offset2, 27 + this.offset3);
            circle(this.x + this.offset2, this.y + 15 + this.offset3, 27 + this.offset2);
            circle(this.x + this.offset3, this.y - 15 + this.offset4, 27 + this.offset1);
            circle(this.x - 15 + this.offset4, this.y + 10 + this.offset3, 27 + this.offset1);
            circle(this.x + 15 + this.offset1, this.y + 10 + this.offset2, 27 + this.offset3);
            circle(this.x - 15 + this.offset2, this.y - 10 + this.offset1, 27 + this.offset4);
            circle(this.x + 15 + this.offset3, this.y - 10 + this.offset4, 27 + this.offset2);
            pop()
        }
    }
}