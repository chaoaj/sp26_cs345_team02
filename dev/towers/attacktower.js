class AttackTower extends Tower {
    constructor(x, y) {
        super(x, y);

        this.img = towerImages.attack;
        this.price = 200;

        this.health = 175;
        this.maxHealth = 175;

        this.spawnCooldown = 120; // frames (2s at 60fps)
        this.lastSpawnFrame = -999;

        this.leashRange = 400;
        this.troopCap = 3;
        
        this.wallDamage = 2; // damage dealt per frame to enemies touching this tower
    }

    update() {
        if (frameCount - this.lastSpawnFrame < this.spawnCooldown) {
            return;
        }

        var activeTroops = 0;

        for (var i = 0; i < troops.length; i++) {
            if (troops[i].tower === this && !troops[i].isDead) {
                activeTroops++;
            }
        }

        if (activeTroops >= this.troopCap) {
            return;
        }

        troops.push(new Troop(this.x, this.y, this));
        this.lastSpawnFrame = frameCount;
    }
}