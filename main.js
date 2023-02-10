import "./style.css";

import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Ball } from "./src/components/objects/ball";
import { mazes } from "./src/mazes/mazes";
import { Vector3 } from "three";
import { textures } from "./src/utils/textures";
import { Maze } from "./src/components/objects/maze";
import { setKey } from "./src/utils/keyControls";
import { setZoom } from "./src/components/camera/orthographicCamera";
import { Box } from "./src/components/objects/box";
import * as GSAP from "gsap";
import {
  sceneObjects,
  lighting,
  scene,
  world,
  cannonDebugger,
  addObject,
  removeObject,
  addBall,
} from "./src/scenes/perspective";
import { maze } from "./src/mazes/dfs";

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

// will eventually get x and y from user input
let X = 17;
let Y = 17;

const clockDiv = document.getElementById("clock");
let time = 0;
let millis;
let timerbool = false;

let mazeParams = {
  algorithm: "dfs",
  X: 17,
  Y: 17,
};

// This example takes 2 seconds to run
const start = Date.now();

console.log("starting timer...");
// Expected output: "starting timer..."

let mazeClass = new Maze(
  {
    dimensions: { x: mazeParams.X, y: mazeParams.Y },
    algoType: mazeParams.algorithm,
    start: { x: -40, z: -45 },
    end: { x: 45 - 17 + X, z: 40 - 17 + Y },
  },
  scene,
  world
);

let controls, stats;
let intersects = [];
var mouse, raycaster;

let camera;

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  getIntersects();
}

function newMaze() {
  mazeClass.derender();
  mazeClass = new Maze(
    {
      dimensions: { x: mazeParams.X, y: mazeParams.Y },
      algoType: mazeParams.algorithm,
      start: { x: -40, z: -45 },
      end: { x: 45, z: 40 },
    },
    scene,
    world
  );
  mazeClass.render();
  // rendering the walls of the new maze
  for (let key in sceneObjects) {
    if (key.includes("wall")) {
      sceneObjects[key].render();
    }
  }
  GSAP.gsap.to(sceneObjects.ball.body.position, {
    x: mazeClass.start.x,
    z: mazeClass.start.z,
    duration: 1,
  });
}

// function onClick() {
//   // console.log(intersects);
//   if (intersects.length > 0 && intersects[1].object.name === "plane") {
//     // console.log('plane clicked');
//     let coordinate = intersects[1].point;
//     console.log(coordinate);
//     // tween the players position to this coordinate
//     var tween = GSAP.gsap.to(player.body.position, {
//       duration: 1,
//       x: coordinate.x,
//       z: coordinate.z,
//       ease: "power3.out",
//     });
//   }
//   if (intersects.length > 0 && intersects[0].object.userData.isClickable) {
//     intersects[0].object.userData.onClick();
//   }
// }

// sceneObjects[`wall${i}`] = new Box({
//   position: { x: i, y: 1, z: -40 },
//   color: 0xff0000,
//   dimension: { x: 5, y: 5, z: 0.5 },
//   speed: 1,
//   mass: 0,
//   linearDamping: 0.3,
//   type: "wall",
//   textures: textures.brick
// }, scene, world);

async function init() {
  // initialization
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  // console.log(renderer.shadowMap)
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  // mouse pointer
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // load camera
  // camera.render();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.y = 65;

  // orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window); // optional
  controls.minAzimuthAngle = -0.05;
  controls.maxAzimuthAngle = 0;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI * 0.125;
  controls.minZoom = 100;
  controls.maxZoom = 200;

  // lighting
  for (let key in lighting) {
    lighting[key].render();
  }

  setInterval(() => {
    millis = Date.now() - start;
    
    console.log(time);

    if (timerbool) {
      time += 10;
      clockDiv.innerHTML = `Time: ${(time / 1000).toFixed(2)}`
    }
    // console.log(`seconds elapsed = ${Math.floor(millis / 1000)}`);
    // Expected output: "seconds elapsed = 2"
  }, 10);

  // renderMaze(m);
  mazeClass.render();
  // console.log(sceneObjects.end.body.addEventListener('collide', function(e) {
  //   console.log('collide');
  // }));
  addBall("ball", mazeClass.start);

  // renders all objects in scene
  for (let key in sceneObjects) {
    sceneObjects[key].render();
  }

  stats = new Stats();
  // add custom panel
  // add memory panel
  // stats.addPanel(new Stats.Panel('Memory', '#ff8', '#221'));
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3: mem, 4: calls, 5: raf, 6: all
  document.body.appendChild(stats.dom);

  // lighting.ambientLight.intensity = 1;
  // add gui
  const gui = new GUI();
  const mazeFolder = gui.addFolder("Maze");
  const mazeProps = {
    get X() {
      return mazeParams.X;
    },
    set X(value) {
      mazeParams.X = value;
    },
    get Y() {
      return mazeParams.Y;
    },
    set Y(value) {
      mazeParams.Y = value;
    },
  };
  mazeFolder.add(mazeParams, "algorithm", {
    DFS: "dfs",
    Kruskal: "kruskal",
    Eller: "eller",
    Prims: "prims",
    "Recursive Backtracking": "recurback",
  });
  mazeFolder.add(mazeProps, "X", 5, 17, 1);
  mazeFolder.add(mazeProps, "Y", 5, 17, 1);
  // add a button to the maze folder
  mazeFolder.add(
    {
      Generate: () => {
        newMaze();
      },
    },
    "Generate"
  );

  const lightingFolder = gui.addFolder("Lighting");
  const directionalLightFolder = lightingFolder.addFolder("Directional Light");
  const directionalLightPositionFolder =
    directionalLightFolder.addFolder("Position");
  const ambientLightFolder = lightingFolder.addFolder("Ambient Light");
  const propsAmbientLight = {
    get Intensity() {
      return lighting.ambientLight.light.intensity;
    },
    set Intensity(value) {
      lighting.ambientLight.light.intensity = value;
    },
    get Color() {
      return lighting.ambientLight.light.color.getHex();
    },
    set Color(value) {
      lighting.ambientLight.light.color.setHex(value);
    },
  };
  const propsDirectionalLight = {
    get Intensity() {
      return lighting.directionalLight.light.intensity;
    },
    set Intensity(value) {
      lighting.directionalLight.light.intensity = value;
    },
    get Color() {
      return lighting.directionalLight.light.color.getHex();
    },
    set Color(value) {
      lighting.directionalLight.light.color.setHex(value);
    },
  };
  const propsDirectionalLightPosition = {
    get X() {
      return lighting.directionalLight.light.position.x;
    },
    set X(value) {
      lighting.directionalLight.light.position.x = value;
    },
    get Y() {
      return lighting.directionalLight.light.position.y;
    },
    set Y(value) {
      lighting.directionalLight.light.position.y = value;
    },
    get Z() {
      return lighting.directionalLight.light.position.z;
    },
    set Z(value) {
      lighting.directionalLight.light.position.z = value;
    },
  };
  ambientLightFolder.add(propsAmbientLight, "Intensity", 0, 1).step(0.01);
  ambientLightFolder
    .addColor(propsAmbientLight, "Color")
    .onChange(function (value) {
      lighting.ambientLight.light.color.setHex(value);
    });
  directionalLightFolder
    .add(propsDirectionalLight, "Intensity", 0, 1)
    .step(0.01);
  directionalLightFolder
    .addColor(propsDirectionalLight, "Color")
    .onChange(function (value) {
      lighting.directionalLight.light.color.setHex(value);
    });
  directionalLightPositionFolder
    .add(propsDirectionalLightPosition, "X", -100, 100)
    .step(0.01);
  directionalLightPositionFolder
    .add(propsDirectionalLightPosition, "Y", -100, 100)
    .step(0.01);
  directionalLightPositionFolder
    .add(propsDirectionalLightPosition, "Z", -100, 100)
    .step(0.01);

  let cannonCylinder = new CANNON.Cylinder(1, 1, 0.5, 3);
  let cannonBody = new CANNON.Body({
    mass: 0,
    shape: cannonCylinder,
    position: new CANNON.Vec3(0, 0, 0),
  });
  world.addBody(cannonBody);

  // event listeners
  // window.addEventListener("click", onClick);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("keydown", (e) => {
    if (e.key === "o") {
      newMaze();
    } else if (e.key === "p") {
      timerbool = !timerbool;
    } else {
      setKey(e, true);
    }
  });
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keyup", (e) => setKey(e, false));
}

function resetFromHover() {
  for (let i = 0; i < intersects.length; i++) {
    let object = intersects[i].object;
    if (object.userData.isHoverable) {
      object.userData.resetHover();
    }
  }
}

function getIntersects() {
  // raycaster.setFromCamera(mouse, camera.camera);
  // intersects = raycaster.intersectObjects(scene.children);
}

function onHover() {
  for (let i = 0; i < intersects.length; i++) {
    let object = intersects[i].object;
    if (object.userData.isHoverable) {
      object.userData.onHover();
    }
  }
}

function animate() {
  onHover();
  stats.begin();
  renderer.render(scene, camera);
  // console.log(mazeParams);
  stats.end();
  resetFromHover();
  // controls.update();
  world.step(1 / 60);

  for (let key in sceneObjects) {
    sceneObjects[key].update();
  }
  cannonDebugger.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
