import {Euler} from 'three/src/math/Euler';
import {Vector3} from 'three/src/math/Vector3';
import {Camera} from 'three/src/cameras/Camera';
import {BaseCollisionHandler, JumpParams} from './BaseCollisionHandler';

const changeEvent = {type: 'change'};
const lockEvent = {type: 'lock'};
const unlockEvent = {type: 'unlock'};
const PI_2 = Math.PI / 2;
const UP = new Vector3(0, 1, 0);

export class PointerLockControls extends BaseCollisionHandler {
	private isLocked = false;
	public minPolarAngle = 0; // radians
	public maxPolarAngle = Math.PI; // radians
	public speed = 1;
	private euler = new Euler(0, 0, 0, 'YXZ');
	private vec = new Vector3();
	private _forces = {
		gravity: new Vector3(0, -9.8, 0),
		jump: new Vector3(0, 0, 0),
		left: 0,
		forward: 0,
	};
	private boundMethods = {
		onMouseMove: this.onMouseMove.bind(this),
		onPointerlockChange: this.onPointerlockChange.bind(this),
		onPointerlockError: this.onPointerlockError.bind(this),
	};
	private _cameraTmp: Camera = new Camera();

	constructor(private camera: Camera, private domElement: HTMLElement) {
		super();
		this.connect();
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
		this.velocity.set(0, 0, 0);
		this.prevTime = performance.now();
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
	private moveUp(camera: Camera, distance: number) {
		camera.position.addScaledVector(UP, distance);
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
	private _jump = false;
	private _jumpStartTime = 0;
	private _jumpDuration = 1000;
	private _jumpForce = 100;
	private _player = {mass: 100};
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
	jump() {
		if (this._playerOnFloor) {
			if (!this._jump) {
				this._jump = true;
				this._jumpStartTime = performance.now();
			}
		} else {
			console.warn('not on floor');
		}
	}
	setJumpParams(params: JumpParams) {
		this._jumpDuration = params.duration * 1000;
		this._jumpForce = params.force;
	}
	setGravity(gravity: Vector3) {
		this._forces.gravity.copy(gravity);
	}
	setPlayerMass(mass: number) {
		this._player.mass = mass;
	}
	private prevTime = 0;
	private _currentAcceleration = new Vector3(0, 0, 0);
	private _playerOnFloor = false;
	private _setPlayerOnFloor(state: boolean) {
		if (state != this._playerOnFloor) {
			console.log('on floor:', state);
		}
		this._playerOnFloor = state;
	}
	// private _gravitySpeed = new Vector3(0, 0, 0);
	update() {
		const time = performance.now();

		if (this.isLocked === true) {
			const delta = (time - this.prevTime) / 1000;
			this.velocity.x -= this.velocity.x * 10.0 * delta;
			this.velocity.z -= this.velocity.z * 10.0 * delta;

			// this._currentAcceleration.copy(this._gravity.forces.gravity).add(this._gravity.forces.jump);
			// this._gravitySpeed.copy(this._currentAcceleration).multiplyScalar(this._gravity.characterMass * delta);
			// console.log(this._currentAcceleration, this._gravitySpeed, delta);
			// this.velocity.copy(this._gravitySpeed);

			this.direction.z = Number(this._moveForward) - Number(this._moveBackward);
			this.direction.x = Number(this._moveRight) - Number(this._moveLeft);
			this.direction.normalize(); // this ensures consistent movements in all directions

			if (this._moveForward || this._moveBackward) {
				this._forces.forward = -this.direction.z * this.speed * 100;
				// this.velocity.z -= this.direction.z * 400.0 * delta * this.speed;
			} else {
				this._forces.forward = 0;
			}
			if (this._moveLeft || this._moveRight) {
				this._forces.left = -this.direction.x * this.speed * 100;
				// this.velocity.x -= this.direction.x * 400.0 * delta * this.speed;
			} else {
				this._forces.left = 0;
			}
			if (this._jump) {
				this._forces.jump.y = this._jumpForce;
				if (time - this._jumpStartTime > this._jumpDuration) {
					this._jump = false;
				}
			} else {
				this._forces.jump.y = 0;
			}

			this._currentAcceleration.copy(this._forces.jump);
			this._currentAcceleration.x += this._forces.left;
			this._currentAcceleration.z += this._forces.forward;
			this._currentAcceleration.add(this._forces.gravity);
			this.velocity.add(this._currentAcceleration.multiplyScalar(delta));

			if (this._playerCollisionController && this.velocity.length() > 0.00001) {
				this._copyToCameraTmp();
				this._applyTmpVelocity(delta);
				const result = this._playerCollisionController.testPosition(this._cameraTmp.position);
				let playerOnFloor = false;
				if (result) {
					playerOnFloor = result.normal.y > 0;
					this.velocity.y = 0;
					this._cameraTmp.position.add(result.normal.multiplyScalar(result.depth));
					this.camera.position.copy(this._cameraTmp.position);
				} else {
					this._applyVelocity(delta);
				}
				this._setPlayerOnFloor(playerOnFloor);
			}
			this._applyVelocity(delta);
		}
		this.prevTime = time;
	}
	private _applyTmpVelocity(delta: number) {
		this._applyVelocityToCam(this._cameraTmp, delta);
	}
	private _applyVelocity(delta: number) {
		this._applyVelocityToCam(this.camera, delta);
	}
	private _applyVelocityToCam(camera: Camera, delta: number) {
		this.moveRight(camera, -this.velocity.x * delta);
		this.moveForward(camera, -this.velocity.z * delta);
		this.moveUp(camera, this.velocity.y * delta);
	}
}
