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
} from "../../scenes/perspective";

class Maze {
  constructor(props, scene, world) {
    this.dimensions = props.dimensions;
    // this.algo = mazes[props.algo](this.dimensions.X, this.dimensions.Y);
    this.algoType = props.algoType;
    this.algo;
    this.horiz;
    this.verti;
    this.start = props.start ? props.start : { x: 0, z: 0 };
    this.end = props.end
      ? props.end
      : { x: this.dimensions.x - 1, z: this.dimensions.y - 1 };
    this.seed;
    this.solution = [];
    this.path = [];
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
    this.i = 1

  }
  getBallCoords() {
    if(this.startCoord.type == "horiz") {
      if(this.startCoord.x == 0 && this.startCoord.z < this.dimensions.y) {
        return { x: -40 + 5 * this.startCoord.z, z: -45 + 2.5 * this.startCoord.x };
      } else if (this.startCoord.x == this.dimensions.x) {
        return { x: -40 + 5 * this.startCoord.z, z: -45 + 5 * this.startCoord.x + 5 };
      } else {
        return { x: -40, z: -45 };
      }
    }
    else {
      if(this.startCoord.z == 0) {
        return { x: -40 + 5 * this.startCoord.z - 5, z: -45 + 5 * this.startCoord.x + 5 };
      } else if (this.startCoord.z == this.dimensions.y) {
        return { x: -40 + 5 * this.startCoord.z, z: -45 + 5 * this.startCoord.x + 5 };
      } else {
        return { x: -40, z: -45 };
      }
    }
  }
  addToPath(dataA, dataB, type) {
    if(type !== 'beginContact') return;
    console.log("hi")
    let puck = dataA.type === 'puck' ? dataA : dataB;
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
              position: { x: -45 + 5 * (j / 4) + 2.5, y: 1, z: -40 + (i - 1) * 2.5 },
              dimension: { x: 0.5, y: 5, z: 5 },
              type: "wall",
            });
          }
        }
      }
    }
    // adding starting and ending point
    removeObject(`${this.startCoord.type}(${this.startCoord.x},${this.startCoord.z})`); 
    // removeObject(`verti(${this.dimensions.x - 1},${this.dimensions.y})`);
    if (this.startCoord.type != "random") {
      removeObject(`${this.endCoord.type}(${this.endCoord.x},${this.endCoord.z})`); 
    }
  }
  generate() {
    this.generateWalls();
    this.generatePucks();
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
        if(checkObject(`puck(${j},${k})`)) {
          sceneObjects[`puck(${j},${k})`].render();
        }
      }
    }
  }
  derender(x,y) {
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
        if(checkObject(`puck(${j},${k})`)) {
          removeObject(`puck(${j},${k})`);
        }
      }
    }
    // removeObject(`end`);
  }
  display(m) {
    for (var j = 0; j < this.dimensions.x * 2 + 1; j++) {
      var line = [];
      if (0 == j % 2)
        for (var k = 0; k < this.dimensions.y * 4 + 1; k++) {
          if (0 == k % 4) {
            line[k] = "x";
          } else if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)]) {
            line[k] = " ";
          } else {
            line[k] = "-";
          }
        }
      else
        for (var k = 0; k < this.dimensions.y * 4 + 1; k++)
          if (0 == k % 4)
            if (k > 0 && m.horiz[(j - 1) / 2][k / 4 - 1]) line[k] = " ";
            else line[k] = "|";
          else line[k] = " ";
      this.text.push(line);
    }
  }
  update() {
    if(this.endCoord.type == 'random') {
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
