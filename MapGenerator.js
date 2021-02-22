const { rndInt } = require("./UtilStuff");

function generateMap() {
  let map = {
    walls: [
      newWall(0, 0, 2500, 0, 15, false),
      newWall(0, 2500, 2500, 2500, 15, false),
      newWall(0, 0, 0, 2500, 15, false),
      newWall(2500, 0, 2500, 2500, 15, false),
      newWall(1500, 0, 1500, 100, 15, true),
    ],
  };
  let numbersOfWalls = 100;

  function newWall(x1, y1, x2, y2, width, hidden) {
    return { x1, y1, x2, y2, width, hidden };
  }
  function makeWall(previousWallEndPoint) {
    while (true) {
      let wall = newWall(
        previousWallEndPoint.x2,
        previousWallEndPoint.y2,
        null,
        null,
        10,
        false
      );
      let wallDirection = ["horizontal", "vertical", "diagonal"][rndInt(0, 2)];
      if (wallDirection === "horizontal") {
        wall.x2 = previousWallEndPoint.x2 + rndInt(-300, 300);
        wall.y2 = previousWallEndPoint.y2;
      } else if (wallDirection === "vertical") {
        wall.x2 = previousWallEndPoint.x2;
        wall.y2 = previousWallEndPoint.y2 + rndInt(-300, 300);
      } else if (wallDirection === "diagonal") {
        wall.x2 = previousWallEndPoint.x2 + rndInt(-300, 300);
        wall.y2 = previousWallEndPoint.y2 + rndInt(-300, 300);
      }
      if (rndInt(0, 100) > 80) {
        wall.hidden = true;
      }
      if (wall.x2 > 2500 || wall.x2 < 0 || wall.y2 > 2500 || wall.y2 < 0) {
        continue;
      }
      return wall;
    }
  }
  for (let i = 0; i < numbersOfWalls; i++) {
    const lastWall = map.walls[map.walls.length - 1];
    map.walls.push(makeWall({ x2: lastWall.x2, y2: lastWall.y2 }));
  }
  return map;
}

exports.generateMap = generateMap;
