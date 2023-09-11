function ellerMaze(x, y) {
  // Check if the dimensions are illegal
  var n = x * y - 1;
  if (n < 0) {
    alert("illegal maze dimensions");
    return;
  }

  // Initialize arrays to store the maze
  var horiz = [];
  var verti = [];

  // Variables to keep track of current location and path
  let here, path, unvisited, next;

  // Initialize the arrays
  for (var j = 0; j < x + 1; j++) (horiz[j] = []), (verti = []);
  for (var j = 0; j < x + 1; j++)
    (verti[j] = []),
      (here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)]),
      (path = [here]),
      (unvisited = []);
  for (var j = 0; j < x + 2; j++) {
    unvisited[j] = [];
    for (var k = 0; k < y + 1; k++)
      unvisited[j].push(
        j > 0 && j < x + 1 && k > 0 && (j != here[0] + 1 || k != here[1] + 1)
      );
  }

  // Generate the maze
  while (0 < n) {
    // Check the potential neighbors
    var potential = [
      [here[0] + 1, here[1]],
      [here[0], here[1] + 1],
      [here[0] - 1, here[1]],
      [here[0], here[1] - 1],
    ];
    var neighbors = [];
    for (var j = 0; j < 4; j++)
      if (unvisited[potential[j][0] + 1][potential[j][1] + 1])
        neighbors.push(potential[j]);

    // If there are unvisited neighbors, visit one of them
    if (neighbors.length) {
      n = n - 1;
      next = neighbors[Math.floor(Math.random() * neighbors.length)];
      unvisited[next[0] + 1][next[1] + 1] = false;
      if (next[0] == here[0])
        horiz[next[0]][(next[1] + here[1] - 1) / 2] = true;
      else verti[(next[0] + here[0] - 1) / 2][next[1]] = true;
      path.push((here = next));
    } else {
      // If there are no unvisited neighbors, backtrack
      here = path.pop();
    }
  }

  // Return the generated maze as an object
  return { x: x, y: y, horiz: horiz, verti: verti };
}

export { ellerMaze };