const Bullet = require("./Bullet");

//abstract
class Weapon {
  constructor(bullet, magSize, remainingBullets, name, recoil) {
    this.name = name;
    this.bullet = bullet;
    this.magBullets = magSize;
    this.magSize = magSize;
    this.remainingBullets = remainingBullets;
    this.fireRate;
    this.recoil = recoil;
  }
  fire(player) {
    if (this.magBullets == 0) {
      this.reload();
      return [];
    }
    if (this.magBullets > 0) {
      this.magBullets -= 1;
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
  reload() {
    let bulletsUsed = this.magSize - this.magBullets;
    if (this.remainingBullets - bulletsUsed < 0) {
      this.magBullets += this.remainingBullets;
      this.remainingBullets = 0;
    } else {
      this.remainingBullets -= bulletsUsed;
      this.magBullets += bulletsUsed;
    }
  }
}

module.exports = Weapon;
