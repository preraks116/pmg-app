import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger'
import { Vector3 } from 'three';    
import { Box } from "../components/objects/box";
import { Ball } from "../components/objects/ball";
import { Plane } from "../components/objects/plane";
import { GLTFModel } from '../components/objects/models/gltfModel';
import { FBXModel } from '../components/objects/models/fbxModel';
import { PerspCamera } from "../components/camera/perspectiveCamera";
import { ambientLight } from '../components/lights/ambientLight';
import { directionalLight } from '../components/lights/directionalLight';
import { textures } from '../utils/textures';

const scene = new THREE.Scene();

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();

const cannonDebugger = new CannonDebugger(scene, world, {
    onInit(body, mesh) {
      // Toggle visibiliy on "d" press
      mesh.visible = false;
      document.addEventListener('keydown', (event) => {
        if (event.key === 'i') {
          mesh.visible = !mesh.visible
        }
      })
    },
})

function addObject(id, cl, props) {
    const obj = new cl(props, scene, world);
    sceneObjects[id] = obj;
    // obj.render();
}

function addBall(id, position) {
    addObject(id, Ball, {
        // position: { x: -40, y: 1, z: -40 },
        position: { x: position.x, y: 1, z: position.z },
        color: 0xff0000,
        radius: 0.5,
        mass: 1,
        speed: new Vector3(0, 0, 0),
        isHoverable: true,
        isClickable: true,
        linearDamping: 0.9,
        angularDamping: 0.9,
        textures: textures.ball,
        type: "player",
        speed: 5
    })
}

function removeObject(id) {
    sceneObjects[id].derender();
    delete sceneObjects[id];
}

function checkObject(id) {
    return sceneObjects[id] ? true : false;
}

// dictionary of all objects
const sceneObjects = {
    // ball: new Ball({
    //     // position: { x: -40, y: 1, z: -40 },
    //     position: { x: -40, y: 1, z: -45 },
    //     color: 0xff0000,
    //     radius: 0.5,
    //     mass: 1,
    //     speed: new Vector3(0, 0, 0),
    //     isHoverable: true,
    //     isClickable: true,
    //     linearDamping: 0.9,
    //     angularDamping: 0.9,
    //     textures: textures.ball,
    //     type: "player",
    //     speed: 5
    // }, scene, world),
    plane: new Plane({
        scene: scene,
        position: { x: 0, y: -0.5, z: 0 },
        color: 0xffffff,
        dimension: { x: 200, y: 200 },
        rotation: {
            x: -Math.PI / 2,
            y: 0,
            z: 0
        },
        mass: 0,
        linearDamping: 0.3,
    }, scene, world),
};

// add 10 horizontal walls from (-40,1,-40) to (40,1,-40)
for (let i = -45; i <= 45; i += 5) {
    sceneObjects[`boundaryX2${i}`] = new Box({
        position: { x: -47.5, y: 1, z: i },
        color: 0xff0000,
        dimension: { x: 0.5, y: 5, z: 5 },
        speed: 1,
        mass: 0,
        linearDamping: 0.3,
        type: "wall",
        textures: textures.brick
    }, scene, world);

    sceneObjects[`boundaryZ1${i}`] = new Box({
        position: { x: i, y: 1, z: -50 + 2.5 },
        color: 0xff0000,
        dimension: { x: 5, y: 5, z: 0.5 },
        speed: 1,
        mass: 0,
        linearDamping: 0.3,
        type: "wall",
        textures: textures.brick
    }, scene, world);

    sceneObjects[`boundaryZ2${i}`] = new Box({
        position: { x: i, y: 1, z: 45 + 2.5 },
        color: 0xff0000,
        dimension: { x: 5, y: 5, z: 0.5 },
        speed: 1,
        mass: 0,
        linearDamping: 0.3,
        type: "wall",
        textures: textures.brick
    }, scene, world);

    sceneObjects[`boundaryX1${i}`] = new Box({
        position: { x: 50 - 2.5, y: 1, z: i },
        color: 0xff0000,
        dimension: { x: 0.5, y: 5, z: 5 },
        speed: 1,
        mass: 0,
        linearDamping: 0.3,
        type: "wall",
        textures: textures.brick
    }, scene, world);
}

const lighting = {
    ambientLight: new ambientLight({
        color: 0xffffff,
        intensity: 0.5
    }, scene),
    directionalLight: new directionalLight({
        color: 0xffffff,
        intensity: 0.5,
        position: { x: 4.83, y: -20.36, z: 4 },
        shadow: true
    }, scene)
}

// // const with all collision behaviors
// const collisions = {
//     // cubePlane: new CANNON.ContactMaterial(
//     //     sceneObjects['cube'].material,
//     //     sceneObjects['plane'].material,
//     //     {
//     //         // friction: 0,
//     //         // restitution: 0.9
//     //     }
//     // )
// }

// // adding collision behaviors to world
// for (let key in collisions) {
//     world.addContactMaterial(collisions[key]);
// }

// camera
// const camera = new PerspCamera({
//     position: { x: 0, y: 65, z: 0 },
//     lookAt: new Vector3(0, 0, 0),
//     up: { x: 0, y: 1, z: 0 },
//     aspect: window.innerWidth / window.innerHeight,
//     near: 0.1,
//     far: 1000,
//     fov: 75
// }, scene);

export { sceneObjects, addObject, removeObject, checkObject, addBall, lighting, scene, world, cannonDebugger };