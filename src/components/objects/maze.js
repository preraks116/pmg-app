import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Box } from "./box";
import { mazes } from "../../mazes/mazes";
import { addObject, checkObject, removeObject } from "../../scenes/perspective";
import { textures } from "../../utils/textures"

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

    this.getAlgo(this.dimensions);
    // this.display(this.algo);
    // console.log(this.algo)
  }
  getAlgo(dimensions) {
    // console.log(dimensions);
    // use this.algoType as key to get from mazes dict
    this.algo = mazes[this.algoType](dimensions.x, dimensions.y);
    this.horiz = this.algo.horiz;
    this.verti = this.algo.verti;
  }
  render() {
    // console.log(maze);
    const mSize = this.text.length;
    const lineSize = this.text[0].length;
    //convert msize and linesize to binary
    const mSizeBinary = this.dimensions.x.toString(2);
    const lineSizeBinary = this.dimensions.y.toString(2);
    // if size of string is less than 7, add 0s to the front
    const paddedX = mSizeBinary.padStart(5, "0");
    const paddedY = lineSizeBinary.padStart(5, "0");
    let seed = "";
    seed += paddedX;
    seed += paddedY;

    // console.log("x:", this.dimensions.x, paddedX);
    // console.log("y:", this.dimensions.y, paddedY);
    let wallSeed = "";
    // console.log(this.algo)
    console.log(this.text)
    let z = -40;
    let x;
    for (let i = 0; i < mSize; i++) {
      if (i % 2 == 0) {
        x = -40;
        for (let j = 0; j < lineSize - 1; j += 4) {
          // console.log(i,j, x);
          if (this.text[i][j + 1] === "-") {
            wallSeed += "1";
            addObject(`wall${i}${j}`, Box, {
              position: { x: x, y: 1, z: z - 2.5 },
              color: 0xff0000,
              dimension: { x: 5, y: 5, z: 0.5 },
              speed: 1,
              mass: 0,
              linearDamping: 0.3,
              type: "wall",
              textures: textures.brick,
            });
          } else {
            wallSeed += "0";
          }
          x += 5;
        }
      } else {
        x = -45;
        for (let j = 0; j < lineSize; j += 4) {
          if (this.text[i][j] === "|") {
            wallSeed += "1";
            addObject(`wall${i}${j}`, Box, {
              position: { x: x + 2.5, y: 1, z: z },
              color: 0xff0000,
              dimension: { x: 0.5, y: 5, z: 5 },
              speed: 1,
              mass: 0,
              linearDamping: 0.3,
              type: "wall",
              textures: textures.brick,
            });
          } else {
            wallSeed += "0";
          }
          x += 5;
        }
        z += 5;
      }
    }
    addObject(`end`, Box, {
        position: { x: this.end.x, y: 1, z: this.end.z },
        color: 0xff0000,
        dimension: { x: 2, y: 1, z: 2 },
        speed: 1,
        mass: 0,
        linearDamping: 0.3,
        type: "end",
    });
    const seedBase36 = parseInt(seed, 2).toString(36);
    // console.log("seed in base 36:", seedBase36);

    const wallSeedBase36 = parseInt(wallSeed, 2).toString(36);
    // console.log("wallseed in base 36:", wallSeedBase36);

    const zeroCount = (wallSeedBase36.match(/0+$/) || [])[0].length;
    // console.log("number of zeros at the end:", zeroCount);

    const trimmedSeed = wallSeedBase36.slice(0, -zeroCount);
    // console.log("after removing zeros:", trimmedSeed);

    const finalSeed = seedBase36 + ":" + trimmedSeed + ":" + zeroCount;

    this.seed = finalSeed;
  }
  derender() {
    for (let i = 0; i < this.text.length; i++) {
      for (let j = 0; j < this.text[0].length; j++) {
        if (checkObject(`wall${i}${j}`)) {
          removeObject(`wall${i}${j}`);
        }
      }
    }
    removeObject(`end`);
  }
  display(m) {

    for (var j = 0; j < this.dimensions.x * 2 + 1; j++) {
      var line = [];
      if (0 == j % 2)
        for (var k = 0; k < this.dimensions.y * 4 + 1; k++) {
          if (0 == k % 4) {
            line[k] = "x";
          }
          else if (j > 0 && m.verti[j / 2 - 1][Math.floor(k / 4)]) {
            line[k] = " ";
          }
          else {
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
  render2() {
    for (var j = 0; j < this.dimensions.x * 2 + 1; j++) {
      if(j % 2 == 0) {
        for (var k = 0; k < this.dimensions.y; k++) {
          if(!(j > 0 && this.algo.verti[j / 2 - 1][k])) {
            // horizontal wall
            addObject(`horiz${j}${k}`, Box, {
              position: { x: -40 + k * 5, y: 1, z: -40 + (j - 1) * 2.5 },
              color: 0xff0000,
              dimension: { x: 5, y: 5, z : 0.5 },
              speed: 1,
              mass: 0,
              linearDamping: 0.3,
              type: "wall",
              textures: textures.brick,
            });
          }
        }
      }
      else {
        for (var k = 0; k < this.dimensions.y; k++) {
          if(k == this.dimensions.y || !(k > 0 && this.algo.horiz[(j - 1) / 2][k - 1])) {
            // vertical wall
            addObject(`verti${j}${k}`, Box, {
              position: { x: -45 + k * 5 + 2.5, y: 1, z: -40 + j * 2.5 - 2.5 },
              color: 0xff0000,
              dimension: { x: 0.5, y: 5, z: 5 },
              speed: 1,
              mass: 0,
              linearDamping: 0.3,
              type: "wall",
              textures: textures.brick,
            });
          }
        }
      }
    }
    // making the start
    
    // fill up the entire last vertical wall
    for (var k = 0; k < this.dimensions.y; k++) {
      addObject(`vertilast${k}`, Box, {
        position: { x: -45 + this.dimensions.y * 5 + 2.5, y: 1, z: -40 + k * 5 },
        color: 0xff0000,
        dimension: { x: 0.5, y: 5, z: 5 },
        speed: 1,
        mass: 0,
        linearDamping: 0.3,
        type: "wall",
        textures: textures.brick,
      });
    }
    removeObject(`horiz${0}${0}`);
    removeObject(`vertilast${this.dimensions.y - 1}`);
  }
}

export { Maze };
