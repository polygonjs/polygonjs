// import {Raycaster, Vector2, Vector3} from 'three';
// import {SoftBody} from './SoftBody';

// function _createRaycaster() {
// 	const raycaster = new Raycaster();
// 	raycaster.layers.set(1);
// 	if (!raycaster.params.Line) {
// 		console.warn('raycaster.params.Line is not defined. Setting it to default value');
// 		raycaster.params.Line = {threshold: 0.1};
// 	}
// 	raycaster.params.Line.threshold = 0.1;
// 	return raycaster;
// }

// export interface GrabberOptions {
// 	// scene: Scene;
// 	// renderer: WebGLRenderer;
// 	// camera: PerspectiveCamera;
// }

// export class Grabber {
// 	public time: number = 0;
// 	public readonly raycaster = _createRaycaster();
// 	public physicsObject: SoftBody | null = null;
// 	public distance = 0.0;
// 	public prevPos = new Vector3();
// 	public vel = new Vector3();
// 	public mousePos = new Vector2();
// 	constructor() {}
// 	increaseTime(dt: number) {
// 		this.time += dt;
// 	}
// 	// updateRaycaster(x: number, y: number) {
// 	// 	const rect = this._options.renderer.domElement.getBoundingClientRect();
// 	// 	this.mousePos.x = ((x - rect.left) / rect.width) * 2 - 1;
// 	// 	this.mousePos.y = -((y - rect.top) / rect.height) * 2 + 1;
// 	// 	this.raycaster.setFromCamera(this.mousePos, this._options.camera);
// 	// }
// 	start(x: number, y: number) {
// 		// this.physicsObject = null;
// 		// this.updateRaycaster(x, y);
// 		// const intersects = this.raycaster.intersectObjects(this._options.scene.children);
// 		// if (intersects.length > 0) {
// 		// 	const obj = intersects[0].object.userData;
// 		// 	if (obj) {
// 		// 		this.physicsObject = obj as SoftBody;
// 		// 		this.distance = intersects[0].distance;
// 		// 		const pos = this.raycaster.ray.origin.clone();
// 		// 		pos.addScaledVector(this.raycaster.ray.direction, this.distance);
// 		// 		this.physicsObject.startGrab(pos);
// 		// 		this.prevPos.copy(pos);
// 		// 		this.vel.set(0.0, 0.0, 0.0);
// 		// 		this.time = 0.0;
// 		// 		// if (gPhysicsScene.paused) run();
// 		// 	}
// 		// }
// 	}
// 	move(x: number, y: number) {
// 		// if (this.physicsObject) {
// 		// 	this.updateRaycaster(x, y);
// 		// 	var pos = this.raycaster.ray.origin.clone();
// 		// 	pos.addScaledVector(this.raycaster.ray.direction, this.distance);
// 		// 	this.vel.copy(pos);
// 		// 	this.vel.sub(this.prevPos);
// 		// 	if (this.time > 0.0) this.vel.divideScalar(this.time);
// 		// 	else this.vel.set(0.0, 0.0, 0.0);
// 		// 	this.prevPos.copy(pos);
// 		// 	this.time = 0.0;
// 		// 	this.physicsObject.moveGrabbed(pos); //, this.vel);
// 		// }
// 	}
// 	end(x: number, y: number) {
// 		if (this.physicsObject) {
// 			this.physicsObject.endGrab(this.prevPos, this.vel);
// 			this.physicsObject = null;
// 		}
// 	}
// }
