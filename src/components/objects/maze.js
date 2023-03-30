import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Box } from "./box";
import { Puck } from "./puck";
import { mazes } from "../../mazes/mazes";
import {
  addObject,
  checkObject,
  removeObject,
  sceneObjects,
} from "../../scenes/scene";

function compress(arr) {
  let binaryStr = "";
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i][j]) {
        binaryStr += "1";
      } else {
        binaryStr += "0";
      }
    }
  }
  const num = parseInt(binaryStr, 2);
  return num.toString(36);
}

function decompress(str) {
  const binaryStr = parseInt(str, 36).toString(2);
  const arr = [];
  let i = 0;
  while (i < binaryStr.length) {
    arr.push(binaryStr.slice(i, i + 16).split(""));
    i += 16;
  }
  return arr;
}



class Maze {
  constructor(props, scene, world) {
    this.dimensions = props.dimensions;
    this.algoType = props.algoType;
    this.start = props.start ? props.start : { x: 0, z: 0 };
    this.end = props.end
      ? props.end
      : { x: this.dimensions.x - 1, z: this.dimensions.y - 1 };
    this.seed;
    this.completed = false;
    this.solution = [];
    this.path = [];
    this.time;
    this.text = [];
    this.scene = scene;
    this.world = world;

    this.algo = mazes[this.algoType](this.dimensions.x, this.dimensions.y);
    this.horiz = this.algo.horiz;
    this.verti = this.algo.verti;

    this.startCoord = this.start;
    this.endCoord = this.end;

    // calculate ball coordinates based on maze dimensions
    this.ballCoord = this.getBallCoords();
  }
  getBallCoords() {
    if (this.startCoord.type == "horiz") {
      if (this.startCoord.x == 0 && this.startCoord.z < this.dimensions.y) {
        return {
          x: -40 + 5 * this.startCoord.z,
          z: -45 + 2.5 * this.startCoord.x,
        };
      } else if (this.startCoord.x == this.dimensions.x) {
        return {
          x: -40 + 5 * this.startCoord.z,
          z: -45 + 5 * this.startCoord.x + 5,
        };
      } else {
        return { x: -40, z: -45 };
      }
    } else {
      if (this.startCoord.z == 0) {
        return {
          x: -40 + 5 * this.startCoord.z - 5,
          z: -45 + 5 * this.startCoord.x + 5,
        };
      } else if (this.startCoord.z == this.dimensions.y) {
        return {
          x: -40 + 5 * this.startCoord.z,
          z: -45 + 5 * this.startCoord.x + 5,
        };
      } else {
        return { x: -40, z: -45 };
      }
    }
  }
  getEndCoords() {
    // same logic as getBallCoords but for the end puck
    if (this.endCoord.type == "horiz") {
      if (this.endCoord.x == 0 && this.endCoord.z < this.dimensions.y) {
        return { x: -40 + 5 * this.endCoord.z, z: -45 + 2.5 * this.endCoord.x };
      } else if (this.endCoord.x == this.dimensions.x) {
        return {
          x: -40 + 5 * this.endCoord.z,
          z: -45 + 5 * this.endCoord.x + 5,
        };
      } else {
        return { x: -40, z: -45 };
      }
    } else {
      if (this.endCoord.z == 0) {
        return {
          x: -40 + 5 * this.endCoord.z - 5,
          z: -45 + 5 * this.endCoord.x + 5,
        };
      } else if (this.endCoord.z == this.dimensions.y) {
        return {
          x: -40 + 5 * this.endCoord.z,
          z: -45 + 5 * this.endCoord.x + 5,
        };
      } else {
        return { x: -40, z: -45 };
      }
    }
  }
  addToPath(dataA, dataB, type) {
    if (type !== "beginContact") return;
    let puck = dataA.type === "puck" ? dataA : dataB;
    this.path.push(puck.coord);
  }
  generatePucks() {
    // console.log(this.dimensions.x, this.dimensions.y)
    for (let i = 0; i < this.dimensions.x; i++) {
      for (let j = 0; j < this.dimensions.y; j++) {
        addObject(`puck(${i},${j})`, Puck, {
          position: { x: -40 + 5 * j, y: 1, z: -40 + 5 * i },
          radius: 1.5,
          height: 0.5,
          coord: { x: i, z: j },
          radialSegments: 4,
        });
      }
    }
  }
  generateWalls() {
    this.display(this.algo);

    const mSize = this.text.length;
    const lineSize = this.text[0].length;

    for (let i = 0; i < mSize; i++) {
      if (i % 2 == 0) {
        for (let j = 0; j < lineSize - 1; j += 4) {
          if (this.text[i][j + 1] === "-") {
            // console.log(i/2, j/4);
            addObject(`horiz(${i / 2},${j / 4})`, Box, {
              position: { x: -40 + 5 * (j / 4), y: 1, z: -40 + (i - 1) * 2.5 },
              dimension: { x: 5, y: 5, z: 0.5 },
              type: "wall",
            });
          }
        }
      } else {
        for (let j = 0; j < lineSize; j += 4) {
          if (this.text[i][j] === "|") {
            addObject(`verti(${(i - 1) / 2},${j / 4})`, Box, {
              position: {
                x: -45 + 5 * (j / 4) + 2.5,
                y: 1,
                z: -40 + (i - 1) * 2.5,
              },
              dimension: { x: 0.5, y: 5, z: 5 },
              type: "wall",
            });
          }
        }
      }
    }
    // adding starting and ending point
    removeObject(
      `${this.startCoord.type}(${this.startCoord.x},${this.startCoord.z})`
    );
    // removeObject(`verti(${this.dimensions.x - 1},${this.dimensions.y})`);
    if (this.startCoord.type != "random") {
      removeObject(
        `${this.endCoord.type}(${this.endCoord.x},${this.endCoord.z})`
      );
    }
  }
  generateEnd() {
    // given the end coordinate, generate the end point
    let position = this.getEndCoords();
    addObject(`end(${this.endCoord.x},${this.endCoord.z})`, Puck, {
      position: { x: position.x, z: position.z },
      radius: 1.5,
      height: 0.5,
      coord: { x: this.endCoord.x, z: this.endCoord.z },
      radialSegments: 4,
      type: "end",
    });
  }
  storeData() {
    // makes a dictionary of the time and the seed and stores it in local storage
    if(!this.time || !this.seed) return;
    let data = {
      time: this.time,
      seed: this.seed,
    };
    let data_list = JSON.parse(localStorage.getItem("scores"));
    data_list.push(data);
    localStorage.setItem("scores", JSON.stringify(data_list));
    // console.log(data)
    return data;
  }
  generate() {
    this.generateWalls();
    this.generatePucks();
    this.generateEnd();
    this.generateSeed();
  }
  generateSeed() {
    let bin_x = this.dimensions.x.toString(2).padStart(5, "0");
    let bin_y = this.dimensions.y.toString(2).padStart(5, "0");
    let verti_seed = compress(this.verti);
    let hori_seed = compress(this.horiz);
    let verti_zeros = verti_seed.match(/0+$/)[0].length;
    let hori_zeros = hori_seed.match(/0+$/)[0].length;
    verti_seed = verti_seed.replace(/0+$/, "");
    hori_seed = hori_seed.replace(/0+$/, "");
    let dim_seed = parseInt(bin_x + bin_y, 2).toString(36);
    this.seed = dim_seed + ":" + verti_seed + ":" + verti_zeros + ":" + hori_seed + ":" + hori_zeros;

    return this.seed;
  }
  decompress(seed) {
    // given the seed it converts into maze parameters
  }
  render() {
    for (var j = 0; j < this.dimensions.x + 1; j++) {
      for (var k = 0; k < this.dimensions.y + 1; k++) {
        if (checkObject(`verti(${j},${k})`)) {
          sceneObjects[`verti(${j},${k})`].render();
        }
        if (checkObject(`horiz(${j},${k})`)) {
          sceneObjects[`horiz(${j},${k})`].render();
        }
        if (checkObject(`puck(${j},${k})`)) {
          sceneObjects[`puck(${j},${k})`].render();
        }
      }
    }
    if (checkObject(`end(${this.endCoord.x},${this.endCoord.z})`)) {
      sceneObjects[`end(${this.endCoord.x},${this.endCoord.z})`].render();
    }
  }
  derender(x, y) {
    ///////// NEED TO FIX X AND Y VALUES CHANGE WHEN RESIZING BEFORE DERENDERING
    // console.log(x,y)
    // for (var j = 0; j < x + 1; j++) {
    //   for (var k = 0; k < y + 1; k++) {
    //     if (checkObject(`verti(${j},${k})`)) {
    //       removeObject(`verti(${j},${k})`);
    //     }
    //     if (checkObject(`horiz(${j},${k})`)) {
    //       removeObject(`horiz(${j},${k})`);
    //     }
    //   }
    // }

    for (var j = 0; j < 18; j++) {
      for (var k = 0; k < 18; k++) {
        if (checkObject(`verti(${j},${k})`)) {
          removeObject(`verti(${j},${k})`);
        }
        if (checkObject(`horiz(${j},${k})`)) {
          removeObject(`horiz(${j},${k})`);
        }
        if (checkObject(`puck(${j},${k})`)) {
          removeObject(`puck(${j},${k})`);
        }
      }
    }
    for (let obh in sceneObjects) {
      if (obh.includes("end")) {
        removeObject(obh);
        // console.log(obh);
      }
    }
    // removeObject(`end`);
  }
  display(m) {
    for (var j = 0; j < this.dimensions.x * 2 + 1; j++) {
      var line = [];
      if (0 == j % 2)
        for (var k = 0; k < this.dimensions.y * 4 + 1; k++) {
          if (k % 4 == 0) {
            line[k] = "x";
          } else if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)]) {
            line[k] = " ";
          } else {
            line[k] = "-";
          }
        }
      else
        for (var k = 0; k < this.dimensions.y * 4 + 1; k++)
          if (k % 4 == 0) {
            if (k > 0 && m.horiz[(j - 1) / 2][k / 4 - 1]) {
              line[k] = " ";
            } else {
              line[k] = "|";
            }
          } else {
            line[k] = " ";
          }
      this.text.push(line);
    }
  }
  update() {
    if (this.endCoord.type == "random") {
      // console.log("hi")
    }
  }

  ////// generate function without using display function - doesnt work on clicking generate button ///////
  // generate() {
  //   for (var j = 0; j < this.dimensions.x * 2 + 1; j++) {
  //     if (j % 2 == 0) {
  //       // renders all the vertical walls in one row
  //       for (var k = 0; k < this.dimensions.y; k++) {
  //         if (!(j > 0 && this.algo.verti[j / 2 - 1][k])) {
  //           // vertical wall
  //           addObject(`verti(${k},${j / 2})`, Box, {
  //             position: { x: -40 + j * 2.5 - 2.5, y: 1, z: -40 + k * 5 },
  //             dimension: { x: 0.5, y: 5, z: 5 },
  //             type: "wall",
  //             textures: textures.brick,
  //           });
  //         }
  //       }
  //     } else {
  //       // renders all the horizontal walls in one row
  //       for (var k = 0; k < this.dimensions.y; k++) {
  //         if(!(j > 0 && this.algo.horiz[(j - 1) / 2][k - 1])) {
  //           // horizontal wall
  //           addObject(`horiz(${k},${(j - 1) / 2})`, Box, {
  //             position: { x: -40 + (j - 1) * 2.5, y: 1, z: -45 + k * 5 + 2.5 },
  //             dimension: { x: 5, y: 5, z: 0.5 },
  //             type: "wall",
  //             textures: textures.brick,
  //           });
  //         }
  //       }
  //     }
  //   }

  //   // fill up the entire last horizontal wall separately
  //   for (var k = 0; k < this.dimensions.x; k++) {
  //     addObject(`horiz(${this.dimensions.x},${k})`, Box, {
  //       position: { x: -40 + k * 5, y: 1, z: -45 + this.dimensions.y * 5 + 2.5 },
  //       dimension: { x: 5, y: 5, z: 0.5 },
  //       type: "wall",
  //       textures: textures.brick,
  //     });
  //   }

  //   removeObject(`horiz(${0},${0})`);
  //   removeObject(`verti(${this.dimensions.x - 1},${this.dimensions.y})`);
  // }
}

export { Maze };
