const Express = require("express")();
const Http = require("http").createServer(Express);
const Socketio = require("socket.io")(Http);
const cors = require("cors");
Express.use(cors());
Http.listen(process.env.PORT || 4000);

var players = {};
var bullets = [];
var clients = Socketio.sockets.clients().connected;

class Bullet {
  constructor(playerX, playerY, angle, socket) {
    this.x = playerX;
    this.y = playerY;
    this.angle = angle;
    this.socket = socket;
    this.speed = 3;
  }

  move() {
    this.x = this.x + this.speed * Math.cos((Math.PI * this.angle) / 180);
    this.y = this.y + this.speed * Math.sin((Math.PI * this.angle) / 180);
  }

  wallCollision() {
    return this.x < 0 || this.x > 640 || this.y < 0 || this.y > 480;
  }
}

class Player {
  constructor() {
    this.x = randomIntFromInterval(0, 640);
    this.y = randomIntFromInterval(0, 480);
    this.name = `Player${randomIntFromInterval(0, 480)}`;
    this.velY = 0;
    this.velX = 0;
    this.speed = 2;
    this.friction = 0.96;
    this.angle = 0;
    this.moves = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
  }
  move() {
    if (this.moves["up"]) {
      if (this.velY > -this.speed) {
        this.velY--;
      }
    }

    if (this.moves["down"]) {
      if (this.velY < this.speed) {
        this.velY++;
      }
    }
    if (this.moves["right"]) {
      if (this.velX < this.speed) {
        this.velX++;
      }
    }
    if (this.moves["left"]) {
      if (this.velX > -this.speed) {
        this.velX--;
      }
    }

    this.velY *= this.friction;
    this.y += this.velY;
    this.velX *= this.friction;
    this.x += this.velX;
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

Socketio.on("connection", (socket) => {
  players[socket.id] = new Player();

  socket.on("move", (data) => {
    players[socket.id].moves[data] = true;
  });
  socket.on("angle", (data) => {
    players[socket.id].angle = data;
  });
  socket.on("stop", (data) => {
    players[socket.id].moves[data] = false;
  });

  socket.on("shoot", () => {
    bullets.push(
      new Bullet(
        players[socket.id].x,
        players[socket.id].y,
        players[socket.id].angle,
        socket.id
      )
    );
  });

  socket.on("shotgun", () => {
    for (let offset = -15; offset <= 15; offset += 10) {
      bullets.push(
        new Bullet(
          players[socket.id].x,
          players[socket.id].y,
          players[socket.id].angle + offset,
          socket.id
        )
      );
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    Socketio.emit("position", players);
  });
});

function isHit(bullet) {
  Object.keys(players).forEach((id) => {
    let player = players[id];
    if (
      bullet.x >= player.x - 10 &&
      bullet.y <= player.y + 10 &&
      bullet.y >= player.y - 10 &&
      bullet.x <= player.x + 10 &&
      bullet.socket != id
    ) {
      return true;
    }
  });
  return false;
}

function wallCollison(data) {
  if (data.x >= 630) {
    data.x = 630;
    data.velX = 0;
  } else if (data.x <= 10) {
    data.x = 10;
    data.velX = 0;
  }
  if (data.y >= 470) {
    data.y = 470;
    data.velY = 0;
  } else if (data.y <= 10) {
    data.y = 10;
    data.velY = 0;
  }
}

function render() {
  //bullets
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    bullet.move();

    if (bullet.wallCollision()) {
      bullets.splice(i, 1);
      i--;
    }
  }
  //players
  Object.keys(players).map((id) => {
    let player = players[id];
    player.move();
  });
  Socketio.emit("render", { players, bullets });
}

setInterval(() => {
  render();
}, 16);
