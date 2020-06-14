const Player = require("./models/Player");
const Bullet = require("./models/Bullet");
const ShotgunBullet = require("./models/ShotgunBullet");
const Express = require("express")();
const Http = require("http").createServer(Express);
const Socketio = require("socket.io")(Http);
const cors = require("cors");

Express.use(cors());
Http.listen(process.env.PORT || 4000);

var players = {};
var bullets = [];
var clients = Socketio.sockets.clients().connected;
var walls = [
  { x1: 100, y1: 0, x2: 100, y2: 100 },
  { x1: 100, y1: 100, x2: 300, y2: 100 },
  { x1: 300, y1: 100, x2: 300, y2: 400 },
];

Socketio.on("connection", (socket) => {
  players[socket.id] = new Player(socket.id);
  socket.emit("map", walls);
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
    let player = players[socket.id];
    if (player.weapon) {
      [...player.fire()].forEach((bullet) => {
        bullets.push(bullet);
      });
    }
  });

  // socket.on("shotgun", () => {
  //   let player = players[socket.id];
  //   for (let offset = -15; offset <= 15; offset += 4) {
  //     bullets.push(new ShotgunBullet(player, player.angle + offset));
  //   }
  // });

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
let renderDist = 250;
function isInRenderDistance(player, object) {
  var dist_points =
    (object.x - player.x) * (object.x - player.x) +
    (object.y - player.y) * (object.y - player.y);
  if (dist_points < renderDist * renderDist) {
    return true;
  }
  return false;
}
function isWallCollision(object) {
  for (let i = 0; i < walls.length; i++) {
    let wall = walls[i];
    const isVertical = wall.x1 - wall.x2 == 0;
    const wallWidth = 10;
    let wallX = (wall.x1 + wall.x2) / 2;
    let wallY = (wall.y1 + wall.y2) / 2;
    const wallLength = isVertical
      ? Math.abs(wall.y1 - wall.y2)
      : Math.abs(wall.x1 - wall.x2);

    if (
      (isVertical &&
        object.x >= wallX - wallWidth - object.size / 2 &&
        object.y <= wallY + wallLength / 2 + wallWidth &&
        object.y >= wallY - wallLength / 2 - wallWidth &&
        object.x <= wallX + wallWidth + object.size / 2) ||
      (!isVertical &&
        object.x >= wallX - wallLength / 2 - wallWidth &&
        object.y <= wallY + wallWidth + object.size / 2 &&
        object.y >= wallY - wallWidth - object.size / 2 &&
        object.x <= wallX + wallLength / 2 + wallWidth)
    ) {
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
function bulletExpired(bullet) {
  return bullet.expTime <= Date.now();
}
function getFilteredPlayers(id) {
  let filtered = {};
  let player = players[id];

  for (let playerId of Object.keys(players)) {
    let comperTo = players[playerId];
    if (isInRenderDistance(player, comperTo) || playerId === id) {
      filtered[playerId] = comperTo;
    }
  }
  return filtered;
}
//TODO: set expiration to bullet and check with system time of the server then delete it
function render() {
  //bullets
  for (let i = 0; i < bullets.length; i++) {
    let bullet = bullets[i];
    bullet.move();
    //bullet.wallCollision() || is commented from the if condition below
    if (isHit(bullet) || bulletExpired(bullet) || isWallCollision(bullet)) {
      bullets.splice(i, 1);
      i--;
    }
  }
  //players
  Object.keys(players).map((id) => {
    let player = players[id];
    let playerX = player.x;
    let playerY = player.y;
    player.move();
    if (isWallCollision(player)) {
      player.x = playerX;
      player.y = playerY;
      player.velY = 0;
      player.velX = 0;
    }
  });
  Object.keys(players).forEach((id) => {
    Socketio.to(id).emit("render", {
      players: getFilteredPlayers(id),
      bullets: bullets.filter((bullet) => {
        isInRenderDistance(players[id], bullet);
      }),
    });
  });
  //Socketio.emit("render", { players, bullets });
}

setInterval(() => {
  render();
}, 16);
