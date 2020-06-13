//abstract
class Weapon {
  constructor(bullet) {
    this.bullet = bullet;
    this.magSize;
    this.fireRate;
    this.recoil;
  }
  fire(player) {
    return [new this.bullet(player)];
  }
}

module.exports = Weapon;
