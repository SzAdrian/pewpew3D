const { rndInt } = require("../UtilStuff");
const Pistol = require("./Pistol");
const Shotgun = require("./Shotgun");

class Player {
  constructor(socket) {
    this.socket = socket;
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
      walk: false,
      up: false,
      down: false,
      left: false,
      right: false,
    };
    this.weapon = new Shotgun();
  }
  move() {
    this.friction = this.moves["walk"] ? 0.75 : 0.96;

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

  fire() {
    if (this.weapon) {
      let bullets = this.weapon.fire(this);
      return bullets;
    } else return null;
  }
}

module.exports = Player;
