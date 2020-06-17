const Player = require("./models/Player");
const Bullet = require("./models/Bullet");
const Express = require("express")();
const Http = require("http").createServer(Express);
const Socketio = require("socket.io")(Http);
const cors = require("cors");
var inside = require("point-in-polygon");

Express.use(cors());
Http.listen(process.env.PORT || 4000);

var players = {};
var bullets = [];
var clients = Socketio.sockets.clients().connected;

var map = {
  walls: [
    { x1: 0, y1: 0, x2: 2500, y2: 0, width: 15 },
    { x1: 0, y1: 2500, x2: 2500, y2: 2500, width: 15 },
    { x1: 0, y1: 0, x2: 0, y2: 2500, width: 15 },
    { x1: 2500, y1: 0, x2: 2500, y2: 2500, width: 15 },
    { x1: 100, y1: 0, x2: 100, y2: 100, width: 15 },
    { x1: 100, y1: 100, x2: 300, y2: 100, width: 15 },
    { x1: 300, y1: 100, x2: 300, y2: 400, width: 15 },
    { x1: 300, y1: 400, x2: 500, y2: 600, width: 15 },
  ],
};

Socketio.on("connection", (socket) => {
  players[socket.id] = new Player(socket.id);
  socket.emit("map", map);
  socket.on("move", (data) => {
    players[socket.id].moves[data] = true;
  });
  socket.on("angle", (data) => {
    players[socket.id].angle = data;
  });
  socket.on("stop", (data) => {
    players[socket.id].moves[data] = false;
  });
  socket.on("reload", () => {
    players[socket.id].weapon.reload();
  });

  socket.on("shoot", () => {
    let player = players[socket.id];
    if (player.weapon) {
      [...player.fire()].forEach((bullet) => {
        bullets.push(bullet);
      });
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

function isInRenderDistance(player, object) {
  var dist_points =
    (object.x - player.x) * (object.x - player.x) +
    (object.y - player.y) * (object.y - player.y);
  if (dist_points < player.viewDistance * player.viewDistance) {
    return true;
  }
  return false;
}

function calcAreaOfTriang(Ax, Ay, Bx, By, Cx, Cy) {
  return Math.abs((Ax * (By - Cy) + Bx * (Cy - Ay) + Cx * (Ay - By)) / 2);
}

function isWallCollisionNew(object) {
  for (let i = 0; i < map.walls.length; i++) {
    let wall = map.walls[i];
    const wallWidth = wall.width;

    let angle =
      Math.atan2(wall.y2 - wall.y1, wall.x2 - wall.x1) * (180 / Math.PI);

    let c1x =
      wall.x1 + (wallWidth / 2) * Math.cos((Math.PI * (angle + 90)) / 180);
    let c1y =
      wall.y1 + (wallWidth / 2) * Math.sin((Math.PI * (angle + 90)) / 180);

    let c2x =
      wall.x1 + (wallWidth / 2) * Math.cos((Math.PI * (angle - 90)) / 180);
    let c2y =
      wall.y1 + (wallWidth / 2) * Math.sin((Math.PI * (angle - 90)) / 180);

    let c3x =
      wall.x2 + (wallWidth / 2) * Math.cos((Math.PI * (angle + 90)) / 180);
    let c3y =
      wall.y2 + (wallWidth / 2) * Math.sin((Math.PI * (angle + 90)) / 180);

    let c4x =
      wall.x2 + (wallWidth / 2) * Math.cos((Math.PI * (angle - 90)) / 180);
    let c4y =
      wall.y2 + (wallWidth / 2) * Math.sin((Math.PI * (angle - 90)) / 180);

    let wallArea =
      Math.sqrt(Math.pow(c1x - c2x, 2) + Math.pow(c1y - c2y, 2)) *
      Math.sqrt(Math.pow(c2x - c4x, 2) + Math.pow(c2y - c4y, 2));

    wallArea += 0.001; //its magic dont touch dis

    let area1 = calcAreaOfTriang(
      c1x,
      c1y,
      c2x,
      c2y,
      object.x + object.size,
      object.y
    );
    let area2 = calcAreaOfTriang(
      c1x,
      c1y,
      c3x,
      c3y,
      object.x + object.size,
      object.y
    );
    let area3 = calcAreaOfTriang(
      c2x,
      c2y,
      c4x,
      c4y,
      object.x + object.size,
      object.y
    );
    let area4 = calcAreaOfTriang(
      c3x,
      c3y,
      c4x,
      c4y,
      object.x + object.size,
      object.y
    );

    let area5 = calcAreaOfTriang(
      c1x,
      c1y,
      c2x,
      c2y,
      object.x - object.size,
      object.y
    );
    let area6 = calcAreaOfTriang(
      c1x,
      c1y,
      c3x,
      c3y,
      object.x - object.size,
      object.y
    );
    let area7 = calcAreaOfTriang(
      c2x,
      c2y,
      c4x,
      c4y,
      object.x - object.size,
      object.y
    );
    let area8 = calcAreaOfTriang(
      c3x,
      c3y,
      c4x,
      c4y,
      object.x - object.size,
      object.y
    );

    let area9 = calcAreaOfTriang(
      c1x,
      c1y,
      c2x,
      c2y,
      object.x,
      object.y + object.size
    );
    let area10 = calcAreaOfTriang(
      c1x,
      c1y,
      c3x,
      c3y,
      object.x,
      object.y + object.size
    );
    let area11 = calcAreaOfTriang(
      c2x,
      c2y,
      c4x,
      c4y,
      object.x,
      object.y + object.size
    );
    let area12 = calcAreaOfTriang(
      c3x,
      c3y,
      c4x,
      c4y,
      object.x,
      object.y + object.size
    );

    let area13 = calcAreaOfTriang(
      c1x,
      c1y,
      c2x,
      c2y,
      object.x,
      object.y - object.size
    );
    let area14 = calcAreaOfTriang(
      c1x,
      c1y,
      c3x,
      c3y,
      object.x,
      object.y - object.size
    );
    let area15 = calcAreaOfTriang(
      c2x,
      c2y,
      c4x,
      c4y,
      object.x,
      object.y - object.size
    );
    let area16 = calcAreaOfTriang(
      c3x,
      c3y,
      c4x,
      c4y,
      object.x,
      object.y - object.size
    );

    if (
      area1 + area2 + area3 + area4 <= wallArea ||
      area5 + area6 + area7 + area8 <= wallArea ||
      area9 + area10 + area11 + area12 <= wallArea ||
      area13 + area14 + area15 + area16 <= wallArea
    ) {
      return true;
    }
  }

  return false;
}

function isWallCollision(object) {
  for (let i = 0; i < map.walls.length; i++) {
    let wall = map.walls[i];
    const isVertical = wall.x1 - wall.x2 == 0;
    const wallWidth = wall.width;
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

function isBulletExpired(bullet) {
  return bullet.expTime <= Date.now();
}
function getFilteredPlayers(id) {
  let filtered = {};
  let player = players[id];

  for (let playerId of Object.keys(players)) {
    let comperTo = players[playerId];
    if (isInRenderDistance(player, comperTo) || playerId === id) {
      filtered[playerId] = {
        viewDistance: comperTo.viewDistance,
        socket: comperTo.socket,
        x: comperTo.x,
        y: comperTo.y,
        name: comperTo.name,
        health: comperTo.health,
        angle: comperTo.angle,
        size: comperTo.size,
        weapon: comperTo.weapon != null,
      };
    }
    if (id == playerId) {
      filtered[playerId]["moves"] = comperTo.moves;
      if (filtered[playerId].weapon) {
        filtered[playerId].weapon = {
          name: comperTo.weapon.name,
          currentBullets: comperTo.weapon.magBullets,
          remainingBullets: comperTo.weapon.remainingBullets,
        };
      }
    }
  }
  return filtered;
}
function getFilteredBullets(id) {
  let filtered = [];
  let player = players[id];

  for (let bullet of bullets) {
    if (isInRenderDistance(player, bullet)) {
      filtered.push(bullet);
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
    if (
      isHit(bullet) ||
      isBulletExpired(bullet) ||
      isWallCollisionNew(bullet)
    ) {
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
    if (isWallCollisionNew(player)) {
      player.x = playerX;
      player.y = playerY;
      player.velY = 0;
      player.velX = 0;
    }
  });
  Object.keys(players).forEach((id) => {
    Socketio.to(id).emit("render", {
      players: getFilteredPlayers(id),
      bullets: getFilteredBullets(id),
    });
  });
  //Socketio.emit("render", { players, bullets });
}

setInterval(() => {
  render();
}, 16);
