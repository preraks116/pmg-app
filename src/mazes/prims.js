function primsMaze(x, y) {
  var n = x * y - 1;
  if (n < 0) {
    alert("illegal maze dimensions");
    return;
  }
  var verti = [];
  var horiz = [];
  for (var i = 0; i < x + 1; i++) {
    verti[i] = [];
    for (var j = 0; j < y; j++) {
      verti[i][j] = false;
    }
  }
  for (var i = 0; i < x; i++) {
    horiz[i] = [];
    for (var j = 0; j < y + 1; j++) {
      horiz[i][j] = false;
    }
  }

  var here = [Math.floor(Math.random() * x), Math.floor(Math.random() * y)];
  var path = [];
  var unvisited = [];
  for (var i = 0; i < x + 2; i++) {
    unvisited[i] = [];
    for (var j = 0; j < y + 2; j++) {
      unvisited[i][j] = true;
    }
  }
  unvisited[here[0] + 1][here[1] + 1] = false;

  while (n > 0) {
    var neighbors = [];
    if (here[0] > 0 && unvisited[here[0]][here[1] + 1]) {
      neighbors.push([here[0] - 1, here[1]]);
    }
    if (here[1] > 0 && unvisited[here[0] + 1][here[1]]) {
      neighbors.push([here[0], here[1] - 1]);
    }
    if (here[0] < x - 1 && unvisited[here[0] + 2][here[1] + 1]) {
      neighbors.push([here[0] + 1, here[1]]);
    }
    if (here[1] < y - 1 && unvisited[here[0] + 1][here[1] + 2]) {
      neighbors.push([here[0], here[1] + 1]);
    }

    if (neighbors.length > 0) {
      var next = neighbors[Math.floor(Math.random() * neighbors.length)];
      unvisited[next[0] + 1][next[1] + 1] = false;
      if (next[0] == here[0]) {
        horiz[next[0]][(next[1] + here[1]) >> 1] = true;
      } else {
        verti[(next[0] + here[0]) >> 1][next[1]] = true;
      }
      path.push(here);
      here = next;
      n--;
    } else {
      here = path.pop();
    }
  }

  return { verti: verti, horiz: horiz };
}

export { primsMaze };