const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require("socket.io")(Http, {
  handlePreflightRequest: (req, res) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});
Socketio.origins(["https://gopewpew.netlify.app/"]);
Http.listen(3000);

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
