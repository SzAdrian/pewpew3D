const Bullet = require("./Bullet");
const { rndInt } = require("../UtilStuff");

class ShotgunBullet extends Bullet {
  constructor(player, angle) {
    super(player);
    this.expTime = Date.now() + 1000;
    this.size = 2;
    this.damage = 1;
    this.angle = angle + rndInt(-8, 8);
  }
}

module.exports = ShotgunBullet;
