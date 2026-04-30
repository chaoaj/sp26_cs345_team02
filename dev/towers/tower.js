class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.size = 130;

        this.health = healthConfig.tower;
        this.maxHealth = healthConfig.tower;

        this.img = null;
        this.price = 0;
    }

    // Returns the shared upgrade config for this tower's type, or null
    // if the type isn't upgradeable (e.g. the base Tower used for collision checks).
    getUpgradeConfig() {
        return towerUpgrades[this.constructor.name] || null;
    }

    // Cost of the next upgrade for this tower's type, given current level.
    upgradeCost() {
        var cfg = this.getUpgradeConfig();
        if (cfg === null || cfg.level >= cfg.maxLevel) return 0;
        return Math.round(cfg.costBase * Math.pow(cfg.costMult, cfg.level - 1));
    }

    // Upgrades every tower of this type. Reads the schedule entry for the
    // current level, deducts cost, bumps the live stat in currentStats, and
    // syncs the new value onto every live tower of this class.
    upgrade() {
        var cfg = this.getUpgradeConfig();
        if (cfg === null) return false;
        if (cfg.level >= cfg.maxLevel) return false;

        var cost = this.upgradeCost();
        if (playerStats.money < cost) return false;

        var entry = cfg.schedule[cfg.level - 1];
        playerStats.money -= cost;
        cfg.level++;
        cfg.currentStats[entry.stat] += entry.delta;

        var newValue = cfg.currentStats[entry.stat];
        for (var i = 0; i < towers.length; i++) {
            if (towers[i].constructor.name === this.constructor.name) {
                towers[i][entry.stat] = newValue;
            }
        }
        return true;
    }

    getUpgradeInfo() {
        var cfg = this.getUpgradeConfig();
        if (cfg === null) {
            return {
                statLabel: null, current: null, next: null,
                cost: 0, level: 1, maxLevel: 1, canAfford: false, maxed: true
            };
        }
        if (cfg.level >= cfg.maxLevel) {
            return {
                statLabel: null, current: null, next: null,
                cost: 0, level: cfg.level, maxLevel: cfg.maxLevel,
                canAfford: false, maxed: true
            };
        }
        var entry = cfg.schedule[cfg.level - 1];
        var cost = this.upgradeCost();
        var current = cfg.currentStats[entry.stat];
        return {
            statLabel: entry.label,
            current: current,
            next: current + entry.delta,
            cost: cost,
            level: cfg.level,
            maxLevel: cfg.maxLevel,
            canAfford: playerStats.money >= cost,
            maxed: false
        };
    }

    draw() {
        
        imageMode(CENTER);
        if (this.img) {
            image(this.img, this.x, this.y, this.size, this.size);
        } else {
            // fallback colored rect if image isn't loaded yet
            var healthRatio = max(0, this.health / this.maxHealth);
            fill(255 * (1 - healthRatio), 100, 255 * healthRatio);
            stroke(0);
            strokeWeight(2);
            rectMode(CENTER);
            rect(this.x, this.y, this.size, this.size);
        }
        drawHealthBar(this.x, this.y, this.size, this.health, this.maxHealth);
    }
}