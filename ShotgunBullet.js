const Bullet = require("./Bullet");

class ShotgunBullet extends Bullet {
  constructor(playerX, playerY, angle, socket) {
    super(playerX, playerY, angle, socket);
    this.expTime = Date.now() + 1000;
  }
}

module.exports = ShotgunBullet;
