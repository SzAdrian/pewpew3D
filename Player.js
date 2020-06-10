const { rndInt } = require("./UtilStuff");

class Player {
  constructor() {
    this.x = rndInt(0, 640);
    this.y = rndInt(0, 480);
    this.name = `Player${rndInt(0, 480)}`;
    this.health = 100;
    this.velY = 0;
    this.velX = 0;
    this.speed = 2;
    this.friction = 0.96;
    this.angle = 0;
    this.size = 10;
    this.moves = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
  }
  move() {
    if (this.moves["up"]) {
      if (this.velY > -this.speed) {
        this.velY--;
      }
    }

    if (this.moves["down"]) {
      if (this.velY < this.speed) {
        this.velY++;
      }
    }
    if (this.moves["right"]) {
      if (this.velX < this.speed) {
        this.velX++;
      }
    }
    if (this.moves["left"]) {
      if (this.velX > -this.speed) {
        this.velX--;
      }
    }

    this.velY *= this.friction;
    this.y += this.velY;
    this.velX *= this.friction;
    this.x += this.velX;
  }

  bulletHit(bullet) {
    this.health -= bullet.damage;
  }
}

module.exports = Player;
