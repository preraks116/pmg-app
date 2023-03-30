import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { Maze } from "./src/components/objects/maze";
import { keyDict, setKey } from "./src/utils/keyControls";
import * as TIME from "./src/utils/time";

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
} from "./src/scenes/scene";
import { maze } from "./src/mazes/dfs";

let num_mazes = 0;
let camerabool = 0;
const default_camera_pos = { x: 0, y: 65, z: 0 };
const camera_birds_eye_height = 30;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const scoreDiv = document.getElementById("score");

// initlaize local storage
localStorage.setItem("scores", JSON.stringify([]));

let mazeParams2 = {
  dimensions: { x: 10, y: 10 },
  algoType: "dfs",
  start: { type: "horiz", x: 0, z: 0 },
  end: { type: "verti", x: 9, z: 10 },
};

let mazeClass = new Maze(mazeParams2, scene, world);

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

function updateScoreUI(data) {
  // increase the height of the div and add the data
  console.log(data);
  scoreDiv.innerHTML += `
  <div>
    <br><p>${mazeClass.seed} -> ${mazeClass.time}s</p>
  </div>
`;
  // let div = document.createElement("div");
  // div.innerHTML = `Maze ${num_mazes}: ${data.time} seconds`;
  // scoreDiv.appendChild(div);
}

function newMaze() {
  if (mazeClass.completed) {
    mazeClass.time = TIME.getTime();
    let data = mazeClass.storeData();
    // console.log(data)
    if (data) {
      updateScoreUI(data);
    }
    TIME.resetTimer();
  }

  mazeClass.derender(mazeClass.dimensions.x, mazeClass.dimensions.y);
  mazeClass = new Maze(mazeParams2, scene, world);
  mazeClass.generate();
  mazeClass.render();

  GSAP.gsap.to(sceneObjects.ball.body.position, {
    x: mazeClass.ballCoord.x,
    z: mazeClass.ballCoord.z,
    duration: 1,
  });
}

function onClick() {
  // console.log(intersects);
  if (intersects.length > 0 && intersects[1].object.name === "plane") {
    // console.log('plane clicked');
    let coordinate = intersects[1].point;
    console.log(coordinate);
    // tween the players position to this coordinate
    var tween = GSAP.gsap.to(player.body.position, {
      duration: 1,
      x: coordinate.x,
      z: coordinate.z,
      ease: "power3.out",
    });
  }
  if (intersects.length > 0 && intersects[0].object.userData.isClickable) {
    intersects[0].object.userData.onClick();
  }
}

async function init() {
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  // mouse pointer
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  // camera.position.y = 65;
  camera.position.set(default_camera_pos.x, default_camera_pos.y, default_camera_pos.z);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.listenToKeyEvents(window);
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

  // timer
  setInterval(() => {
    TIME.getTime();
  }, TIME.dt);

  mazeClass.generate();

  addBall("ball", mazeClass.getBallCoords());

  // renders all objects in scene
  for (let key in sceneObjects) {
    sceneObjects[key].render();
  }

  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  // add gui
  const gui = new GUI();
  const mazeFolder = gui.addFolder("Maze");
  mazeFolder.add(mazeParams2, "algoType", {
    DFS: "dfs",
    Kruskal: "kruskal",
    Eller: "eller",
    Prims: "prims",
    "Recursive Backtracking": "recurback",
    Aldous: "aldous",
  });
  const sizeFolder = mazeFolder.addFolder("Size");
  const mazeProps = {
    get X() {
      return mazeParams2.dimensions.x;
    },
    set X(value) {
      mazeParams2.dimensions.x = value;
    },
    get Y() {
      return mazeParams2.dimensions.y;
    },
    set Y(value) {
      mazeParams2.dimensions.y = value;
    },
  };

  sizeFolder.add(mazeProps, "X", 5, 17, 1);
  sizeFolder.add(mazeProps, "Y", 5, 17, 1);
  sizeFolder.onChange(function (v) {
    // reload the startFolder
    startX.destroy();
    startY.destroy();
    startX = startFolder.add(
      mazeParams2.start,
      "x",
      0,
      mazeParams2.dimensions.x,
      1
    );
    startY = startFolder.add(
      mazeParams2.start,
      "z",
      0,
      mazeParams2.dimensions.y,
      1
    );

    // reload the endFolder
    endX.destroy();
    endY.destroy();
    endX = endFolder.add(mazeParams2.end, "x", 0, mazeParams2.dimensions.x, 1);
    endY = endFolder.add(mazeParams2.end, "z", 0, mazeParams2.dimensions.y, 1);
  });
  const startFolder = mazeFolder.addFolder("Start");
  startFolder.add(mazeParams2.start, "type", {
    Vertical: "verti",
    Horizontal: "horiz",
  });
  let startX = startFolder.add(
    mazeParams2.start,
    "x",
    0,
    mazeParams2.dimensions.x,
    1
  );
  let startY = startFolder.add(
    mazeParams2.start,
    "z",
    0,
    mazeParams2.dimensions.y,
    1
  );

  const endFolder = mazeFolder.addFolder("End");
  let endSelect = endFolder.add(mazeParams2.end, "type", {
    Vertical: "verti",
    Horizontal: "horiz",
    Random: "random",
  });
  let endX = endFolder.add(
    mazeParams2.end,
    "x",
    0,
    mazeParams2.dimensions.x,
    1
  );
  let endY = endFolder.add(
    mazeParams2.end,
    "z",
    0,
    mazeParams2.dimensions.y,
    1
  );
  endSelect.onChange(function (v) {
    if (v == "random") {
      endX.disable();
      endY.disable();
    } else {
      endX.enable();
      endY.enable();
    }
  });

  // add a button to the maze folder
  mazeFolder.add(
    {
      Generate: () => {
        // check if start coordinates are valid
        let startValue = 1;
        let endValue = 1;
        // for valid start
        if (mazeParams2.start.type == "verti") {
          if (
            !(
              (mazeParams2.start.z == 0 ||
                mazeParams2.start.z == mazeParams2.dimensions.y) &&
              mazeParams2.start.x < mazeParams2.dimensions.x
            )
          ) {
            startValue = 0;
          }
        } else {
          if (
            !(
              (mazeParams2.start.x == 0 ||
                mazeParams2.start.x == mazeParams2.dimensions.x) &&
              mazeParams2.start.z < mazeParams2.dimensions.y
            )
          ) {
            startValue = 0;
          }
        }
        // for valid end
        if (mazeParams2.end.type == "verti") {
          if (
            !(
              (mazeParams2.end.z == 0 ||
                mazeParams2.end.z == mazeParams2.dimensions.y) &&
              mazeParams2.end.x < mazeParams2.dimensions.x
            )
          ) {
            endValue = 0;
          }
        } else {
          if (
            !(
              (mazeParams2.end.x == 0 ||
                mazeParams2.end.x == mazeParams2.dimensions.x) &&
              mazeParams2.end.z < mazeParams2.dimensions.y
            )
          ) {
            endValue = 0;
          }
        }

        if (!startValue) {
          alert("Invalid start coordinates");
          return;
        }
        if (!endValue && endSelect.getValue() != "random") {
          alert("Invalid end coordinates");
          return;
        }
        // here specifically if the button is pressed the timer needs to be reset
        TIME.resetTimer();
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

  // event listeners
  // window.addEventListener("click", onClick);
  window.addEventListener("mousemove", onMouseMove, false);
  window.addEventListener("keydown", (e) => {
    if (e.key in keyDict) {
      TIME.startTimer();
    }
    if (e.key === "o") {
      newMaze();
    } else if (e.key === "t") {
      mazeClass.derender();
    } else if (e.key === "p") {
      // timerbool = !timerbool;
    } else if(e.key === "c") {
      if(camerabool) {
        // enable scroll to zoom here
        camera.position.set(default_camera_pos.x, default_camera_pos.y, default_camera_pos.z);
        camerabool = 0;
      } else {
        // disable scroll to zoom here
        camerabool = 1;
      }
    } else if (e.key === "r") {
      TIME.resetTimer();
    } else {
      setKey(e, true);
    }
  });
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keyup", (e) => setKey(e, false));

  // collision detection listeners
  world.addEventListener("beginContact", (e) => {
    interactionHandler(e, "beginContact");
  });
  world.addEventListener("endContact", (e) => {
    interactionHandler(e, "endContact");
  });
}

function interactionHandler(e, type) {
  const { bodyA, bodyB } = e;
  // console.log(bodyA, bodyB);
  if (!bodyA || !bodyB) return;
  if (!bodyA.material.name || !bodyB.material.name) return;
  let dataA = JSON.parse(bodyA.material.name);
  let dataB = JSON.parse(bodyB.material.name);

  if (dataA.type === "puck" || dataB.type === "puck") {
    mazeClass.addToPath(dataA, dataB, type);
  } else if (dataA.type === "end" || dataB.type === "end" && !mazeClass.completed) {
    mazeClass.completed = true;
    num_mazes++;
    console.log("completed maze");
    newMaze();
  }
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
  stats.end();
  resetFromHover();
  // console.log(mazeClass)
  world.step(1 / 60);
  // console.log(sceneObjects['ball'].body.position.x)
  console.log(camera.position)
  if(camerabool) {
    camera.position.set(sceneObjects['ball'].body.position.x, camera_birds_eye_height, sceneObjects['ball'].body.position.z);
  }
  for (let key in sceneObjects) {
    sceneObjects[key].update();
  }
  mazeClass.update();
  cannonDebugger.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
