function refresh() {
    location.reload();

}

// delete element from the array
function removeFromArray(arr, elt) {
  // Could use indexOf here instead to be more efficient
  // traversing backwards as when an item is deleted
  // and the elements slide back you could skip one
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

function generatePath(spot) {
  path = [];

  // for (var i = 0; i < path.length; i++) {
    // path[i].show(color(0, 0, 255));
  //}

  if (spot) {
    path.push(spot);
    while (spot.previous) {
      path.push(spot.previous);
      spot = spot.previous;
    }
  }
  return path;
}

function drawPath(path) {
  // Drawing path as continuous line
  noFill();
  stroke(0, 175, 255);
  strokeWeight(w / 2);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}

// An educated guess of how far it is between two points
// euclidian distance
function heuristic(a, b) {
  return dist(a.i, a.j, b.i, b.j);
}

// grid size = cols * rows
var cols = 50;
var rows = 50;

// This will the 2D array
var grid = new Array(cols);

// Open and closed set
var openSet = [];
var closedSet = [];

// Start and end
var start;
var end;

// Width and height of each cell of grid
var w, h;

// The road taken
var path = [];
var closestSpot = undefined;

var canvas;

function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  canvas.position(x, y);
}

function windowResized() {
  centerCanvas();
}

function setup() {
  canvas = createCanvas(550, 550);
  centerCanvas();

  console.log('A*');

  // Grid cell size
  w = width / cols;
  h = height / rows;

  // Making a 2D array
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  // All the neighbors
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }


  // Start and end
  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  start.wall = false;
  end.wall = false;

  // openSet starts with beginning only
  openSet.push(start);
}

function draw() {
  var current;

  // Am I still searching?
  if (openSet.length > 0) {

    // next best option
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    current = openSet[winner];

    // Did I finish?
    if (current === end) {
      noLoop();
      console.log("DONE!");
    }

    // Best option moves from openSet to closedSet
    removeFromArray(openSet, current);
    closedSet.push(current);

    // Check all the neighbors
    var neighbors = current.neighbors;
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i];

      // Valid next spot?
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        var tempG = current.g + heuristic(neighbor, current);

        // Is this a better path than before?
        var newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } else {
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        // Yes, it's a better path
        if (newPath) {
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;

          // Is this the closest to the goal that we've seen?
          if ( !closestSpot || neighbor.h < closestSpot.h ) {
            closestSpot = neighbor;
          }
        }
      }

    }
  // Uh oh, no solution
  } else {
    console.log('no solution');

    current = closestSpot;
    alert("no complete solution for current maze, please refresh")
    noLoop();
  }

  // Draw current state of everything
  background(255);

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }

  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0, 70));
  }

  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 255, 0, 70));
  }


  // Find the path by working backwards
  var path = generatePath(current);
  drawPath(path);
}
