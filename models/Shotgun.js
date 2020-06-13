const ShotgunBullet = require("./ShotgunBullet");
const Weapon = require("./Weapon");

class Shotgun extends Weapon {
  constructor() {
    super(ShotgunBullet);
  }

  fire(player) {
    let bullets = [];
    for (let offset = -25; offset <= 25; offset += 10) {
      bullets.push(new this.bullet(player, player.angle + offset));
    }
    return bullets;
  }
}
module.exports = Shotgun;
