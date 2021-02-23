const { rndInt } = require("../UtilStuff");

class Bullet {
  constructor(player, speed, damage, recoil, size, expTime) {
    this.x = player.x + 20 * Math.cos((Math.PI * player.angle) / 180);
    this.y = player.y + 20 * Math.sin((Math.PI * player.angle) / 180);
    this.angle = player.angle + this.calculateRecoil(player, recoil);
    this.player = player;
    this.socket = player.socket;
    this.speed = speed;
    this.damage = damage;
    this.size = size;
    this.expTime = Date.now() + expTime;
  }

  calculateRecoil(player, recoil) {
    const isPlayerMoving =
      Math.abs(player.velX) >= 0.3 || Math.abs(player.velY) >= 0.3;

    const isPlayerWalking = player.moves.walk;
    if (isPlayerMoving) {
      if (isPlayerWalking) {
        //WALKING
        const reducedRecoil = recoil * 0.6;
        return rndInt(-reducedRecoil, reducedRecoil);
      }
      //RUNNING
      return rndInt(-recoil, recoil);
    } else {
      //STANDING
      const reducedRecoil = recoil * 0.45;
      return rndInt(-reducedRecoil, reducedRecoil);
    }
  }

  move() {
    this.x = this.x + this.speed * Math.cos((Math.PI * this.angle) / 180);
    this.y = this.y + this.speed * Math.sin((Math.PI * this.angle) / 180);
  }
}

module.exports = Bullet;
