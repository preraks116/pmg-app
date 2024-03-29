import * as CANNON from 'cannon-es';

class Puck {
    constructor(props, scene, world) {
        this.position = props.position;
        this.radius = props.radius ? props.radius : 1;
        this.height = props.height ? props.height : 0.5;
        this.coord = { x: props.coord.x, z: props.coord.z}
        this.radialSegments = props.radialSegments ? props.radialSegments : 3;
        this.scene = scene;
        this.type = props.type ? props.type : "puck";
        this.world = world;

        const data = {
            type: this.type,
            coord: {
                x: props.coord.x,
                z: props.coord.z,
            }
        }
        this.material = new CANNON.Material(JSON.stringify(data));

        this.body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Cylinder(this.radius, this.radius, this.height, this.radialSegments),
            position: new CANNON.Vec3(this.position.x, this.position.y, this.position.z),
            collisionResponse: false,
            material: this.material
        });
    }
    render() {
        this.world.addBody(this.body);
    }
    derender() {
        this.world.removeBody(this.body);
    }
    update() {

    }
}

export { Puck };