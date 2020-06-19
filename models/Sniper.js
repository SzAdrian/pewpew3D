const Weapon = require("./Weapon");
const Bullet = require("./Bullet");

class Sniper extends Weapon {
  constructor() {
    super(
      { size: 3, speed: 10, expTime: 5000, damage: 20 },
      1,
      6,
      "Sniper",
      1,
      1000,
      1000
    );
  }
  fire(player) {
    if (this.magBullets == 0) {
      this.reload();
      return [];
    }
    if (this.magBullets > 0) {
      this.magBullets -= 1;
      this.reload();
      return [
        new Bullet(
          player,
          this.bullet.speed,
          this.bullet.damage,
          this.recoil,
          this.bullet.size,
          this.bullet.expTime
        ),
      ];
    }
  }
}

module.exports = Sniper;
