// generating maze using aldous-broder algorithm
function aldous(x, y) {
  // Create empty maze with all walls present
  let horiz = new Array(x).fill(null).map(() => new Array(y - 1).fill(true));
  let verti = new Array(x - 1).fill(null).map(() => new Array(y).fill(true));

  // Choose random starting cell
  let i = Math.floor(Math.random() * x);
  let j = Math.floor(Math.random() * y);

  // Count number of visited cells
  let visited = 1;

  // Continue until all cells have been visited
  while (visited < x * y) {
    // Choose random neighbor
    let neighbors = [];
    if (i > 0 && !horiz[i - 1][j]) neighbors.push([-1, 0]);
    if (j > 0 && !verti[i][j - 1]) neighbors.push([0, -1]);
    if (i < x - 1 && !horiz[i][j]) neighbors.push([1, 0]);
    if (j < y - 1 && !verti[i][j]) neighbors.push([0, 1]);
    let [di, dj] = neighbors[Math.floor(Math.random() * neighbors.length)];

    // Move to neighbor cell
    i += di;
    j += dj;

    // If cell hasn't been visited before, remove wall between current and neighbor cell
    if (
      horiz[Math.min(i, i - di)][Math.min(j, j - dj)] ||
      verti[Math.min(i, i - di)][Math.min(j, j - dj)]
    ) {
      if (di == -1) horiz[i - 1][j] = false;
      if (dj == -1) verti[i][j - 1] = false;
      if (di == 1) horiz[i][j] = false;
      if (dj == 1) verti[i][j] = false;
      visited++;
    }
  }

  // Return maze
  return { x: x, y: y, horiz: horiz, verti: verti };
}

export { aldous }