import {Euler} from 'three/src/math/Euler';
import {Camera} from 'three/src/cameras/Camera';
import {CorePlayer} from '../../../core/player/Player';
import {EventDispatcher} from 'three/src/core/EventDispatcher';
import {Vector3} from 'three/src/math/Vector3';
import {Spherical} from 'three/src/math/Spherical';

const changeEvent = {type: 'change'};
const lockEvent = {type: 'lock'};
const unlockEvent = {type: 'unlock'};
const PI_2 = Math.PI / 2;
const tmpCameraUnproject = new Vector3();
const spherical = new Spherical();

export class PointerLockControls extends EventDispatcher {
	private isLocked = false;
	public minPolarAngle = 0; // radians
	public maxPolarAngle = Math.PI; // radians
	public rotateSpeed = 1;
	private euler = new Euler(0, 0, 0, 'YXZ');
	private boundMethods = {
		onMouseMove: this.onMouseMove.bind(this),
		onPointerlockChange: this.onPointerlockChange.bind(this),
		onPointerlockError: this.onPointerlockError.bind(this),
	};
	private _azimuthalAngle: number = 0;

	constructor(private camera: Camera, public readonly domElement: HTMLElement, private player?: CorePlayer) {
		super();
		this.connect();
	}

	onMouseMove(event: MouseEvent) {
		if (this.isLocked === false) return;

		var movementX = event.movementX || (event as any).mozMovementX || (event as any).webkitMovementX || 0;
		var movementY = event.movementY || (event as any).mozMovementY || (event as any).webkitMovementY || 0;

		this.euler.setFromQuaternion(this.camera.quaternion);

		this.euler.y -= movementX * 0.002 * this.rotateSpeed;
		this.euler.x -= movementY * 0.002 * this.rotateSpeed;

		this.euler.x = Math.max(PI_2 - this.maxPolarAngle, Math.min(PI_2 - this.minPolarAngle, this.euler.x));

		this.camera.quaternion.setFromEuler(this.euler);
		this._computeAzimuthalAngle();

		this.dispatchEvent(changeEvent);
	}
	private _computeAzimuthalAngle() {
		this.camera.updateMatrixWorld();
		tmpCameraUnproject.set(0, 0, 1);
		this.camera.localToWorld(tmpCameraUnproject);
		tmpCameraUnproject.sub(this.camera.position);
		spherical.setFromVector3(tmpCameraUnproject);
		this._azimuthalAngle = spherical.theta;
	}

	onPointerlockChange() {
		// this.velocity.set(0, 0, 0);
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

	lock() {
		this.domElement.requestPointerLock();
	}

	unlock() {
		this.domElement.ownerDocument.exitPointerLock();
	}

	update(delta: number) {
		if (this.player) {
			this.player.setAzimuthalAngle(this._azimuthalAngle);
			this.player.update(delta);
		}
	}
}
