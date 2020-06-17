const Bullet = require("./Bullet");
const Weapon = require("./Weapon");

class Pistol extends Weapon {
  constructor() {
    super({ size: 3, speed: 3, expTime: 2000, damage: 3 }, 10, 20, "Pistol", 5);
  }
}

module.exports = Pistol;
