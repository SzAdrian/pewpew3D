const { rndInt } = require("../UtilStuff");
const Pistol = require("./Pistol");
const Shotgun = require("./Shotgun");
const SMG = require("./SMG");
const Sniper = require("./Sniper");

class Player {
  constructor(socket) {
    this.viewDistance = 250;
    this.socket = socket;
    this.x = rndInt(50, 2450);
    this.y = rndInt(50, 2450);
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
    this.weapon = this.pickRandomWeapon();
    this.lastBulletHitFrom = null;
  }

  respawn() {
    this.health = 100;
    this.velY = 0;
    this.velX = 0;
    this.x = rndInt(50, 2450);
    this.y = rndInt(50, 2450);
    this.weapon = this.pickRandomWeapon();
  }

  pickRandomWeapon() {
    return [new Pistol(), new SMG(), new Sniper(), new Shotgun()][rndInt(0, 3)];
  }

  move() {
    this.friction = this.moves["walk"] ? 0.75 : 0.96;
    this.speed = this.moves["walk"] ? 1.45 : 2;
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
    this.lastBulletHitFrom = bullet.player.name;
  }

  fire() {
    if (this.weapon) {
      let bullets = this.weapon.fire(this);
      if (this.weapon.magBullets == 0 && this.weapon.remainingBullets == 0) {
        this.dropWeapon();
      }
      return bullets;
    } else return null;
  }

  dropWeapon() {
    this.weapon = null;
  }
}

module.exports = Player;
