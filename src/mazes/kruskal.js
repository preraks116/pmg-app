function kruskalMaze(x, y) {
  // Check for illegal maze dimensions
  if (x <= 0 || y <= 0) {
    console.error("Illegal maze dimensions");
    return;
  }

  // Initialize arrays to store the maze structure
  let horiz = [];
  let verti = [];
  for (let i = 0; i < x + 1; i++) {
    horiz[i] = [];
    for (let j = 0; j < y; j++) {
      horiz[i][j] = false;
    }
  }

  for (let i = 0; i < x; i++) {
    verti[i] = [];
    for (let j = 0; j < y + 1; j++) {
      verti[i][j] = false;
    }
  }

  // Create a list of all walls
  let walls = [];
  for (let i = 0; i < x; i++) {
    for (let j = 0; j < y; j++) {
      walls.push([i, j, "E"]);
      walls.push([i, j, "S"]);
    }
  }

  // Randomize the order of the walls
  walls.sort(() => Math.random() - 0.5);

  // Initialize a disjoint set data structure
  let sets = [];
  for (let i = 0; i < x * y; i++) {
    sets[i] = i;
  }

  // Iterate over the walls, removing walls that connect separate components
  let numSets = x * y;
  for (let i = 0; i < walls.length; i++) {
    let wall = walls[i];
    let x1 = wall[0];
    let y1 = wall[1];
    let x2 = x1 + (wall[2] === "E" ? 1 : 0);
    let y2 = y1 + (wall[2] === "S" ? 1 : 0);
    let p1 = y1 * x + x1;
    let p2 = y2 * x + x2;
    if (findSet(p1, sets) !== findSet(p2, sets)) {
      if (wall[2] === "E") {
        horiz[x1][y1] = true;
      } else {
        verti[x1][y1] = true;
      }
      unionSets(p1, p2, sets);
      numSets--;
    }
  }

  // Return the maze
  return { x: x, y: y, horiz: horiz, verti: verti };
}

// Helper function to find the set a node belongs to
function findSet(node, sets) {
  if (sets[node] !== node) {
    sets[node] = findSet(sets[node], sets);
  }
  return sets[node];
}

// Helper function to union two sets
function unionSets(a, b, sets) {
  sets[findSet(a, sets)] = findSet(b, sets);
}

export { kruskalMaze };