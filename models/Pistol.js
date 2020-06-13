const Bullet = require("./Bullet");
const Weapon = require("./Weapon");

class Pistol extends Weapon {
  constructor() {
    super(Bullet);
  }
}

module.exports = Pistol;
