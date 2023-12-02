import {BaseEvent, Euler, Camera, EventDispatcher, Vector3, Spherical} from 'three';
import {CorePlayer} from '../../../core/player/Player';
import {CorePlayerKeyEvents} from '../../../core/player/KeyEvents';

const changeEvent: BaseEvent<'change'> = {type: 'change' as 'change'};
const lockEvent: BaseEvent<'lock'> = {type: 'lock'};
const unlockEvent: BaseEvent<'unlock'> = {type: 'unlock'};
const PI_2 = Math.PI / 2;
const tmpCameraUnproject = new Vector3();
const spherical = new Spherical();

const LOCK_ELEMENT_DEFAULT_HTML = `
<div style="
	text-align:center;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%,-50%);
	cursor: pointer;
	padding: 5px 10px;
	background:gray;
	border:white;
	color: white;
	">
	<div style="font-size: 1rem">CLICK TO START</div>
	<div style="font-size: 0.6rem">press ESC to show your cursor</div>
</div>
`;

interface PointerLockControlsOptions {
	lockHTMLElement?: HTMLElement;
}

export class PointerLockControls extends EventDispatcher<{change: any}> {
	private isLocked = false;
	public minPolarAngle = 0; // radians
	public maxPolarAngle = Math.PI; // radians
	public rotateSpeed = 1;
	private euler = new Euler(0, 0, 0, 'YXZ');
	private boundMethods = {
		lock: this.lock.bind(this),
		onMouseMove: this.onMouseMove.bind(this),
		onPointerlockChange: this.onPointerlockChange.bind(this),
		onPointerlockError: this.onPointerlockError.bind(this),
	};
	private _azimuthalAngle: number = 0;
	private _corePlayerKeyEvents: CorePlayerKeyEvents | undefined;

	constructor(
		private camera: Camera,
		public readonly domElement: HTMLElement,
		private options: PointerLockControlsOptions,
		private player?: CorePlayer
	) {
		super();
		this.connect();
		this._showUnlockHTMLElement();
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
			this._removeHTMLElement();
			if (this.player) {
				this._corePlayerKeyEvents = this._corePlayerKeyEvents || new CorePlayerKeyEvents(this.player);
				this._corePlayerKeyEvents.addEvents();
			}
		} else {
			this.dispatchEvent(unlockEvent);
			this.isLocked = false;
			this._showUnlockHTMLElement();
			this._corePlayerKeyEvents?.removeEvents();
			this.player?.stop();
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
		this._removeHTMLElement();
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

	//
	//
	// HTML Element
	//
	//
	private __unlockHTMLElement: HTMLElement | undefined;
	private _unlockHTMLElementParent() {
		return this.domElement.parentElement;
	}
	private _unlockHTMLElement() {
		return (this.__unlockHTMLElement = this.__unlockHTMLElement || this._getUnlockHTMLElement());
	}
	private _showUnlockHTMLElement() {
		const el = this._unlockHTMLElement();
		if (!el) {
			return;
		}
		this._unlockHTMLElementParent()?.append(el);
	}
	private _getUnlockHTMLElement(): HTMLElement | undefined {
		const element = this.options.lockHTMLElement || this._createUnlockHTMLElement();
		element.addEventListener('pointerdown', this.boundMethods.lock);
		return element;
	}
	private _createUnlockHTMLElement(): HTMLElement {
		const el = document.createElement('div');
		el.innerHTML = LOCK_ELEMENT_DEFAULT_HTML;
		return el;
	}
	private _removeHTMLElement() {
		if (!this.__unlockHTMLElement) {
			return;
		}
		this._unlockHTMLElementParent()?.removeChild(this.__unlockHTMLElement);
		this.__unlockHTMLElement.removeEventListener('pointerdown', this.boundMethods.lock);
		this.__unlockHTMLElement = undefined;
	}
}
