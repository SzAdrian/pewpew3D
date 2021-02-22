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
    let bullet = [];
    if (this.magBullets == 0) {
      this.reload();
      return bullet;
    }
    if (
      this.magBullets > 0 &&
      Date.now() - this.lastShotTime >= this.fireRate
    ) {
      this.magBullets -= 1;
      this.lastShotTime = Date.now();

      this.reload();
      bullet = [
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
    return bullet;
  }
}

module.exports = Sniper;
