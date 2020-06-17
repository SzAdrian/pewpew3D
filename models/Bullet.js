const { rndInt } = require("../UtilStuff");

class Bullet {
  constructor(player, speed, damage, recoil, size, expTime) {
    this.x = player.x + 20 * Math.cos((Math.PI * player.angle) / 180);
    this.y = player.y + 20 * Math.sin((Math.PI * player.angle) / 180);
    this.angle = player.angle + rndInt(-recoil, recoil);
    this.socket = player.socket;
    this.speed = speed;
    this.damage = damage;
    this.size = size;
    this.expTime = Date.now() + expTime;
  }

  move() {
    this.x = this.x + this.speed * Math.cos((Math.PI * this.angle) / 180);
    this.y = this.y + this.speed * Math.sin((Math.PI * this.angle) / 180);
  }
}

module.exports = Bullet;
