function recurbackMaze(x, y) {
    let grid = [];
    for (let i = 0; i < x; i++) {
        grid[i] = [];
        for (let j = 0; j < y; j++) {
            grid[i][j] = false;
        }
    }

    let verti = [];
    for (let i = 0; i <= x; i++) {
        verti[i] = [];
        for (let j = 0; j < y; j++) {
            verti[i][j] = false;
        }
    }

    let horiz = [];
    for (let i = 0; i < x; i++) {
        horiz[i] = [];
        for (let j = 0; j <= y; j++) {
            horiz[i][j] = false;
        }
    }

    function carve_passages_from(cx, cy) {
        let directions = [            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1]
        ];
        shuffle(directions);
        for (let i = 0; i < directions.length; i++) {
            let nx = cx + directions[i][0];
            let ny = cy + directions[i][1];
            if (nx >= 0 && nx < x && ny >= 0 && ny < y && !grid[nx][ny]) {
                grid[cx][cy] = true;
                grid[nx][ny] = true;
                if (directions[i][0] === 1) {
                    horiz[cx][cy + 1] = true;
                } else if (directions[i][0] === -1) {
                    horiz[nx][ny + 1] = true;
                } else if (directions[i][1] === 1) {
                    verti[cx + 1][cy] = true;
                } else if (directions[i][1] === -1) {
                    verti[nx + 1][ny] = true;
                }
                carve_passages_from(nx, ny);
            }
        }
    }

    carve_passages_from(Math.floor(Math.random() * x), Math.floor(Math.random() * y));
    return { horiz: horiz, verti: verti };
}

function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

export { recurbackMaze };