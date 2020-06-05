const Player = require("./Player");
const Bullet = require("./Bullet");
const Express = require("express")();
const Http = require("http").createServer(Express);
const Socketio = require("socket.io")(Http);
const cors = require("cors");

Express.use(cors());
Http.listen(process.env.PORT || 4000);

var players = {};
var bullets = [];
var clients = Socketio.sockets.clients().connected;

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
  });
});

function isHit(bullet) {
  let playersArray = Object.keys(players);
  for (let i = 0; i < playersArray.length; i++) {
    let id = playersArray[i];
    let player = players[id];
    if (
      bullet.x >= player.x - 10 &&
      bullet.y <= player.y + 10 &&
      bullet.y >= player.y - 10 &&
      bullet.x <= player.x + 10 &&
      bullet.socket != id
    ) {
      player.bulletHit(bullet);
      return true;
    }
  }
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
    if (bullet.wallCollision() || isHit(bullet)) {
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
