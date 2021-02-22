const Bullet = require("./Bullet");
const Weapon = require("./Weapon");

//bullet,magSize,remainingBullets,name,recoil,fireRate,reloadTime
class SMG extends Weapon {
  constructor() {
    super(
      { size: 2, speed: 6, expTime: 1600, damage: 1 },
      30,
      90,
      "SMG",
      20,
      100,
      1900
    );
  }
}

module.exports = SMG;
