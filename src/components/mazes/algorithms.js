import { maze } from "./algorithms/dfs.js";
import { ellerMaze } from "./algorithms/eller.js";
import { kruskalMaze } from "./algorithms/kruskal.js";
import { primsMaze } from "./algorithms/prims.js";
import { recurbackMaze } from "./algorithms/recurback.js";
import { aldous } from "./algorithms/aldous.js";

const algorithms = {
    dfs: maze,
    eller: ellerMaze,
    kruskal: kruskalMaze,
    prims: primsMaze,
    recurback: recurbackMaze,
    aldous: aldous,
}

export { algorithms };