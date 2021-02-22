const Bullet = require("./Bullet");

//abstract
class Weapon {
  constructor(
    bullet,
    magSize,
    remainingBullets,
    name,
    recoil,
    fireRate,
    reloadTime
  ) {
    this.name = name;
    this.bullet = bullet;
    this.magBullets = magSize;
    this.magSize = magSize;
    this.remainingBullets = remainingBullets;
    this.fireRate = fireRate;
    this.reloadTime = reloadTime;
    this.recoil = recoil;
    this.isReloading = false;
    this.lastShotTime = 0;
  }
  fire(player) {
    if (this.magBullets == 0) {
      this.reload();
    }
    if (
      this.magBullets > 0 &&
      !this.isReloading &&
      Date.now() - this.lastShotTime >= this.fireRate
    ) {
      this.lastShotTime = Date.now();
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
    return [];
  }
  reload() {
    let bulletsUsed = this.magSize - this.magBullets;
    if (this.magBullets != this.magSize && !this.isReloading) {
      this.isReloading = true;
      setTimeout(() => {
        if (this.remainingBullets - bulletsUsed < 0) {
          this.magBullets += this.remainingBullets;
          this.remainingBullets = 0;
        } else {
          this.remainingBullets -= bulletsUsed;
          this.magBullets += bulletsUsed;
        }
        this.isReloading = false;
      }, this.reloadTime);
    }
  }
}

module.exports = Weapon;
