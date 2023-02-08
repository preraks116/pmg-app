import { maze } from "./dfs.js";
import { ellerMaze } from "./eller.js";
import { kruskalMaze } from "./kruskal.js";
import { primsMaze } from "./prims.js";
import { recurbackMaze } from "./recurback.js";


const mazes = {
    dfs: maze,
    eller: ellerMaze,
    kruskal: kruskalMaze,
    prims: primsMaze,
    recurback: recurbackMaze,
}

export { mazes };