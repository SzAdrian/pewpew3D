const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http);
Express.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
Http.listen(4000, () => {
  console.log("Listening at :4000");
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
