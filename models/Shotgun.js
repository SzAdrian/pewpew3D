const Weapon = require("./Weapon");
const Bullet = require("./Bullet");

class Shotgun extends Weapon {
  constructor() {
    super(
      { size: 2, speed: 3, expTime: 1000, damage: 1 },
      5,
      15,
      "Shotgun",
      20,
      1300,
      800
    );
  }

  fire(player) {
    if (this.magBullets == 0) {
      this.reload();
      return [];
    }
    if (this.magBullets > 0) {
      this.magBullets -= 1;

      let bullets = [];
      for (let offset = -25; offset <= 25; offset += 10) {
        bullets.push(
          new Bullet(
            player,
            this.bullet.speed,
            this.bullet.damage,
            this.recoil,
            this.bullet.size,
            this.bullet.expTime
          )
        );
      }
      return bullets;
    }
  }
}
module.exports = Shotgun;
