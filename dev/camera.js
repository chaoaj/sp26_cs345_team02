var camera = {
    x: 0,
    y: 0,
};

function updateCamera() {
    var halfW = width / 2;
    var halfH = height / 2;

    var targetX = playerStats.x;
    var targetY = playerStats.y;

    camera.x = constrain(targetX, -WORLD_SIZE / 2 + halfW, WORLD_SIZE / 2 - halfW);
    camera.y = constrain(targetY, -WORLD_SIZE / 2 + halfH, WORLD_SIZE / 2 - halfH)
}

