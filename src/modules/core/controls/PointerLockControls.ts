import {Euler} from 'three/src/math/Euler';
import {EventDispatcher} from 'three/src/core/EventDispatcher';
import {Vector3} from 'three/src/math/Vector3';
import {Camera} from 'three/src/cameras/Camera';
import {Object3D} from 'three/src/core/Object3D';
import {PlayerCollisionController} from './collisions/PlayerCollisionsController';
import {Object3DWithGeometry} from '../../../core/geometry/Group';
import {Mesh} from 'three/src/objects/Mesh';
import {Capsule} from 'three/examples/jsm/math/Capsule';

const changeEvent = {type: 'change'};
const lockEvent = {type: 'lock'};
const unlockEvent = {type: 'unlock'};
const PI_2 = Math.PI / 2;

export class PointerLockControls extends EventDispatcher {
	private isLocked = false;
	public minPolarAngle = 0; // radians
	public maxPolarAngle = Math.PI; // radians
	public speed = 1;
	private euler = new Euler(0, 0, 0, 'YXZ');
	private vec = new Vector3();
	private boundMethods = {
		onMouseMove: this.onMouseMove.bind(this),
		onPointerlockChange: this.onPointerlockChange.bind(this),
		onPointerlockError: this.onPointerlockError.bind(this),
	};
	private _playerCollisionController: PlayerCollisionController | undefined;
	private _cameraTmp: Camera = new Camera();

	constructor(private camera: Camera, private domElement: HTMLElement) {
		super();
		this.connect();
	}

	setCheckCollisions(collisionObject?: Object3D) {
		if (collisionObject) {
			let objectWithGeo: Object3DWithGeometry | undefined;
			collisionObject.traverse((child) => {
				if (!objectWithGeo) {
					const mesh = child as Mesh;
					if (mesh.geometry) {
						objectWithGeo = mesh;
					}
				}
			});
			if (objectWithGeo) {
				this._playerCollisionController = new PlayerCollisionController(objectWithGeo);
			} else {
				console.error('no geo found in', collisionObject);
			}
		} else {
			this._playerCollisionController = undefined;
		}
	}
	setCollisionCapsule(capsule: Capsule) {
		this._playerCollisionController?.setCapsule(capsule);
	}

	onMouseMove(event: MouseEvent) {
		if (this.isLocked === false) return;

		var movementX = event.movementX || (event as any).mozMovementX || (event as any).webkitMovementX || 0;
		var movementY = event.movementY || (event as any).mozMovementY || (event as any).webkitMovementY || 0;

		this.euler.setFromQuaternion(this.camera.quaternion);

		this.euler.y -= movementX * 0.002;
		this.euler.x -= movementY * 0.002;

		this.euler.x = Math.max(PI_2 - this.maxPolarAngle, Math.min(PI_2 - this.minPolarAngle, this.euler.x));

		this.camera.quaternion.setFromEuler(this.euler);

		this.dispatchEvent(changeEvent);
	}
	onPointerlockChange() {
		if (this.domElement.ownerDocument.pointerLockElement === this.domElement) {
			this.dispatchEvent(lockEvent);

			this.isLocked = true;
		} else {
			this.dispatchEvent(unlockEvent);

			this.isLocked = false;
		}
	}

	onPointerlockError() {
		console.error(
			'THREE.PointerLockControls: Unable to use Pointer Lock API (Note that you need to wait for 2 seconds to lock the pointer after having just unlocked it)'
		);
	}
	connect() {
		this.domElement.ownerDocument.addEventListener('mousemove', this.boundMethods.onMouseMove);
		this.domElement.ownerDocument.addEventListener('pointerlockchange', this.boundMethods.onPointerlockChange);
		this.domElement.ownerDocument.addEventListener('pointerlockerror', this.boundMethods.onPointerlockError);
	}

	disconnect() {
		this.domElement.ownerDocument.removeEventListener('mousemove', this.boundMethods.onMouseMove);
		this.domElement.ownerDocument.removeEventListener('pointerlockchange', this.boundMethods.onPointerlockChange);
		this.domElement.ownerDocument.removeEventListener('pointerlockerror', this.boundMethods.onPointerlockError);
	}

	dispose() {
		this.disconnect();
	}

	getObject() {
		// retaining this method for backward compatibility

		return this.camera;
	}

	// this.getDirection = (function () {
	// 	var direction = new Vector3(0, 0, -1);

	// 	return function (v) {
	// 		return v.copy(direction).applyQuaternion(camera.quaternion);
	// 	};
	// })();

	private moveForward(camera: Camera, distance: number) {
		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		this.vec.setFromMatrixColumn(camera.matrix, 0);

		this.vec.crossVectors(camera.up, this.vec);

		camera.position.addScaledVector(this.vec, distance);
	}

	private moveRight(camera: Camera, distance: number) {
		this.vec.setFromMatrixColumn(camera.matrix, 0);

		camera.position.addScaledVector(this.vec, distance);
	}
	private _copyToCameraTmp() {
		this._cameraTmp.position.copy(this.camera.position);
		this._cameraTmp.matrix.copy(this.camera.matrix);
		this._cameraTmp.up.copy(this.camera.up);
	}

	lock() {
		this.domElement.requestPointerLock();
	}

	unlock() {
		this.domElement.ownerDocument.exitPointerLock();
	}

	private velocity = new Vector3();
	private direction = new Vector3();

	private _moveForward = false;
	private _moveBackward = false;
	private _moveLeft = false;
	private _moveRight = false;
	setMoveForward(state: boolean) {
		this._moveForward = state;
	}
	setMoveBackward(state: boolean) {
		this._moveBackward = state;
	}
	setMoveLeft(state: boolean) {
		this._moveLeft = state;
	}
	setMoveRight(state: boolean) {
		this._moveRight = state;
	}
	private prevTime = 0;
	update() {
		const time = performance.now();

		if (this.isLocked === true) {
			const delta = (time - this.prevTime) / 1000;
			this.velocity.x -= this.velocity.x * 10.0 * delta;
			this.velocity.z -= this.velocity.z * 10.0 * delta;

			this.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

			this.direction.z = Number(this._moveForward) - Number(this._moveBackward);
			this.direction.x = Number(this._moveRight) - Number(this._moveLeft);
			this.direction.normalize(); // this ensures consistent movements in all directions

			if (this._moveForward || this._moveBackward)
				this.velocity.z -= this.direction.z * 400.0 * delta * this.speed;
			if (this._moveLeft || this._moveRight) this.velocity.x -= this.direction.x * 400.0 * delta * this.speed;

			if (this._playerCollisionController) {
				this._copyToCameraTmp();
				this.moveRight(this._cameraTmp, -this.velocity.x * delta);
				this.moveForward(this._cameraTmp, -this.velocity.z * delta);
				const result = this._playerCollisionController.testPosition(this._cameraTmp.position);
				if (result) {
					this._cameraTmp.position.add(result.normal.multiplyScalar(result.depth));
					this.camera.position.copy(this._cameraTmp.position);
				} else {
					this._applyVelocity(delta);
				}
			}
			this._applyVelocity(delta);
		}
		this.prevTime = time;
	}
	private _applyVelocity(delta: number) {
		this.moveRight(this.camera, -this.velocity.x * delta);
		this.moveForward(this.camera, -this.velocity.z * delta);
	}
}
