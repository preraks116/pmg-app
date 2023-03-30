import { Camera } from "three";

const keyDict = {
    "w": {
        "pressed": false,
        "x": 0,
        "y": 0,
        "z": 1,
        // "z": -1,
    },
    "a": {
        "pressed": false,
        "x": 1,
        // "x": -1 ,
        "y": 0,
        "z": 0,
    },
    "s": {
        "pressed": false,
        "x": 0,
        "y": 0,
        "z": -1,
        // "z": 1,
    },
    "d": {
        "pressed": false,
        "x": -1,
        // "x": 1,
        "y": 0,
        "z": 0,
    }
}

function setKey(e, val, camera) {
    if (keyDict[e.key]) {
        keyDict[e.key].pressed = val;
    }
    if(e.key === "w" && val) {
        // camera.lookAt(0, 0, 0);
    }
}

export { keyDict, setKey };