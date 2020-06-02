const Express = require("express")();
const Http = require("http").createServer(Express);
const Socketio = require("socket.io")(Http);
const cors = require("cors");
Express.use(cors());
Http.listen(process.env.PORT || 4000);
Express.get("/go", function (req, res, next) {
  return "gogogo";
});
var players = {};
var clients = Socketio.sockets.clients().connected;

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
const initPlayer = () => {
  return {
    x: randomIntFromInterval(0, 640),
    y: randomIntFromInterval(0, 480),
    velY: 0,
    velX: 0,
    speed: 2,
    friction: 0.96,
    angle: 0,
    moves: {
      up: false,
      down: false,
      left: false,
      right: false,
    },
  };
};

Socketio.on("connection", (socket) => {
  players[socket.id] = initPlayer();
  Socketio.emit("position", players);

  socket.on("move", (data) => {
    players[socket.id].moves[data] = true;
    Socketio.emit("position", players);
  });
  socket.on("angle",(data) => {
    players[socket.id].angle = data
  })
  socket.on("stop", (data) => {
    players[socket.id].moves[data] = false;
    Socketio.emit("position", players);
  });
  socket.on("update", (data) => {
    if (data) {
      wallCollison(data);
      players[socket.id] = data;
    }
    Socketio.emit("position", players);
  });
  socket.on("disconnect", () => {
    delete players[socket.id];
    Socketio.emit("position", players);
  });
});

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
  Object.keys(players).map((id) => {
    let player = players[id];

    if (player.moves["up"]) {
      if (player.velY > -player.speed) {
        player.velY--;
      }
    }

    if (player.moves["down"]) {
      if (player.velY < player.speed) {
        player.velY++;
      }
    }
    if (player.moves["right"]) {
      if (player.velX < player.speed) {
        player.velX++;
      }
    }
    if (player.moves["left"]) {
      if (player.velX > -player.speed) {
        player.velX--;
      }
    }

    player.velY *= player.friction;
    player.y += player.velY;
    player.velX *= player.friction;
    player.x += player.velX;
  });
  Socketio.emit("render", players);
}

setInterval(() => {
  render();
}, 16);
