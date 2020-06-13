const { rndInt } = require("../UtilStuff");

class Bullet {
  constructor(player) {
    this.x = player.x;
    this.y = player.y;
    this.angle = player.angle + rndInt(-5, 5);
    this.socket = player.socket;
    this.speed = 3;
    this.damage = 1;
    this.size = 3;
    this.expTime = Date.now() + 2000;
  }

  move() {
    this.x = this.x + this.speed * Math.cos((Math.PI * this.angle) / 180);
    this.y = this.y + this.speed * Math.sin((Math.PI * this.angle) / 180);
  }

  wallCollision() {
    return this.x < 0 || this.x > 640 || this.y < 0 || this.y > 480;
  }
}

module.exports = Bullet;
