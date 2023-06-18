/**
 * adapted from threejs r133 DeviceOrientationControls
 */

import {Euler, EventDispatcher, MathUtils, Quaternion, Vector2, Vector3, Matrix4} from 'three';
// import {mod} from '../../math/_Module';
// import {CoreUserAgent} from '../../UserAgent';

interface DeviceOrientationEventExtended extends DeviceOrientationEvent {
	requestPermission?: () => Promise<string>;
	webkitCompassHeading?: number;
}
interface WindowEventMapExtended extends WindowEventMap {
	deviceorientationabsolute: DeviceOrientationEvent;
}

declare global {
	interface Window {
		addEventListener<K extends keyof WindowEventMapExtended>(
			type: K,
			listener: (this: Window, ev: WindowEventMapExtended[K]) => any,
			options?: boolean | AddEventListenerOptions
		): void;
		removeEventListener<K extends keyof WindowEventMapExtended>(
			type: K,
			listener: (this: Window, ev: WindowEventMapExtended[K]) => any,
			options?: boolean | EventListenerOptions
		): void;
	}
}

const EPS = 0.000001;
const _zee = new Vector3(0, 0, 1);
const _y = new Vector3(0, 1, 0);
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
const _qTarget = new Quaternion();
const _qOffset = new Quaternion();
// const _eulerTarget = new Euler();
const _matrix = new Matrix4();
const _localPos = new Vector3();
const _localPos2D = new Vector2();
// const _angleRef = new Vector3(0, 0, 1);
// const _eulerTarget2 = new Euler();
const _changeEvent = {type: 'change'};

// function getYAngle(x: number, y: number): number {
// 	let angle = Math.atan2(y, x) * (180 / Math.PI); // Convert radians to degrees
// 	return angle < 0 ? angle + 360 : angle; // Convert negative degrees to positive
// }

function setObjectQuaternion(quaternion: Quaternion, alpha: number, beta: number, gamma: number, orient: number) {
	_euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

	quaternion.setFromEuler(_euler); // orient the device

	quaternion.multiply(_q1); // camera looks out the back of the device, not the top

	quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient)); // adjust for screen orientation
}
function _setQuaternion(
	_alpha: number | null,
	_beta: number | null,
	_gamma: number | null,
	_screenOrientation: number | null,
	target: Quaternion
) {
	const _alpha1 = 1 * (_alpha != null ? _alpha : 0); // Z
	// if (this._lastAbsoluteAlphaDelta != null && this._startAbsoluteAlphaDelta != null) {
	// 	this.alphaOffset =
	// 		0 *
	// 		lerp(
	// 			this.alphaOffset,
	// 			this._lastAbsoluteAlphaDelta -
	// 				(this._useStartAbsoluteAlpha ? this._startAbsoluteAlphaDelta : 0),
	// 			this._lerpFactor()
	// 		);
	// 	debugDelta(this.alphaOffset);
	// }

	const alpha = MathUtils.degToRad(_alpha1 /* - this.alphaOffset*/); // Z

	const beta = _beta != null ? MathUtils.degToRad(_beta) : 0; // X'

	const gamma = _gamma != null ? MathUtils.degToRad(_gamma) : 0; // Y''

	const orient = _screenOrientation ? MathUtils.degToRad(_screenOrientation) : 0; // O

	setObjectQuaternion(target, alpha, beta, gamma, orient);
}

// function lerp(src: number, dest: number, lerp: number) {
// 	return dest; //lerp * dest + (1 - lerp) * src;
// }
// function _modAlpha(n: number): number {
// 	return mod(n, 360);
// }
// function compassHeadingOrAlpha(e: DeviceOrientationEventExtended): number {
// 	return e.webkitCompassHeading != null ? e.webkitCompassHeading : e.alpha != null ? e.alpha : 0;
// }

// let _debugAlphaEl: HTMLElement | undefined;
// let _debugBetaEl: HTMLElement | undefined;
// let _debugGammaEl: HTMLElement | undefined;
let _debugAbsoluteAEl: HTMLElement | undefined;
let _debugAbsoluteBEl: HTMLElement | undefined;
let _debugCompassHeadingEl: HTMLElement | undefined;
// let _debugAlphaAbsoluteEl: HTMLElement | undefined;
// let _debugStartAlphaAbsoluteEl: HTMLElement | undefined;
// let _debugDeltaEl: HTMLElement | undefined;
// let _debugEulerXEl: HTMLElement | undefined;
let _debugXEl: HTMLElement | undefined;
let _debugZEl: HTMLElement | undefined;
let _debugEulerYEl: HTMLElement | undefined;
// let _debugEulerZEl: HTMLElement | undefined;
let _debugYOffsetEl: HTMLElement | undefined;
// function debugAlpha(num: number) {
// 	_debugAlphaEl = _debugAlphaEl || (document.getElementById('debug-alpha') as HTMLElement);
// 	_debugAlphaEl.innerText = num.toFixed(0);
// }
// function debugBeta(num: number) {
// 	_debugBetaEl = _debugBetaEl || (document.getElementById('debug-beta') as HTMLElement);
// 	_debugBetaEl.innerText = num.toFixed(0);
// }
// function debugGamma(num: number) {
// 	_debugGammaEl = _debugGammaEl || (document.getElementById('debug-gamma') as HTMLElement);
// 	_debugGammaEl.innerText = num.toFixed(0);
// }
function debugAbsoluteA(state: boolean) {
	_debugAbsoluteAEl = _debugAbsoluteAEl || (document.getElementById('debug-absolute-a') as HTMLElement);
	_debugAbsoluteAEl.innerText = `${state}`;
}
function debugAbsoluteB(state: boolean) {
	_debugAbsoluteBEl = _debugAbsoluteBEl || (document.getElementById('debug-absolute-b') as HTMLElement);
	_debugAbsoluteBEl.innerText = `${state}`;
}
function debugCompassHeading(num: number) {
	_debugCompassHeadingEl =
		_debugCompassHeadingEl || (document.getElementById('debug-compass-heading') as HTMLElement);
	_debugCompassHeadingEl.innerText = num.toFixed(0);
}
// function debugEulerX(num: number) {
// 	_debugEulerXEl = _debugEulerXEl || (document.getElementById('debug-eulerx') as HTMLElement);
// 	_debugEulerXEl.innerText = num.toFixed(0);
// }
function debugX(num: number) {
	_debugXEl = _debugXEl || (document.getElementById('debug-x') as HTMLElement);
	_debugXEl.innerText = num.toFixed(3);
}
function debugZ(num: number) {
	_debugZEl = _debugZEl || (document.getElementById('debug-z') as HTMLElement);
	_debugZEl.innerText = num.toFixed(3);
}
function debugEulerY(num: number) {
	_debugEulerYEl = _debugEulerYEl || (document.getElementById('debug-eulery') as HTMLElement);
	_debugEulerYEl.innerText = num.toFixed(0);
}
// function debugEulerZ(num: number) {
// 	_debugEulerZEl = _debugEulerZEl || (document.getElementById('debug-eulerz') as HTMLElement);
// 	_debugEulerZEl.innerText = num.toFixed(0);
// }
function debugYOffset(num: number) {
	_debugYOffsetEl = _debugYOffsetEl || (document.getElementById('debug-y-offset') as HTMLElement);
	_debugYOffsetEl.innerText = num.toFixed(0);
}
// function debugAlphaAbsolute(num: number) {
// 	_debugAlphaAbsoluteEl = _debugAlphaAbsoluteEl || (document.getElementById('debug-alpha-absolute') as HTMLElement);
// 	_debugAlphaAbsoluteEl.innerText = num.toFixed(0);
// }
// function debugStartAlphaAbsolute(num: number) {
// 	_debugStartAlphaAbsoluteEl =
// 		_debugStartAlphaAbsoluteEl || (document.getElementById('debug-start-alpha-absolute') as HTMLElement);
// 	_debugStartAlphaAbsoluteEl.innerText = num.toFixed(0);
// }
// function debugDelta(num: number) {
// 	_debugDeltaEl = _debugDeltaEl || (document.getElementById('debug-delta') as HTMLElement);
// 	_debugDeltaEl.innerText = num.toFixed(0);
// }

export class DeviceOrientationControls extends EventDispatcher {
	public enabled: boolean = true;
	public screenOrientation: number = 0;
	private lastQuaternion = new Quaternion();
	public readonly quaternion = new Quaternion();
	// private alphaOffset: number = 0; // radians
	private lastDeviceOrientationEvent: DeviceOrientationEventExtended | undefined;
	// private lastDeviceOrientationAbsoluteEvent: DeviceOrientationEvent | undefined;
	public absoluteUpdateFrequency = 5000;
	protected _currentAngle = 0;
	// protected _yOffset = 0;
	private _absoluteY = 0;
	// public readonly object: Object3D = new Object3D();
	// public readonly child:Object3D = new Object3D();
	// private _useStartAbsoluteAlpha = false;
	// private _startAbsoluteAlphaDelta: number | undefined;
	// private _lastAbsoluteAlphaDelta: number | undefined;
	// private _lastAbsolutedAlphaDeltaUpdatedAt: number | undefined;
	constructor() {
		super();

		if (window.isSecureContext === false) {
			console.error(
				'THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)'
			);
		}

		// this.object.rotation.reorder('YXZ');
		// this.child.position.z = -1;
		// this.object.add(this.child)
		// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

		this.connect();
	}
	onDeviceOrientationChangeEvent(event: DeviceOrientationEventExtended) {
		this.lastDeviceOrientationEvent = event;
		if (event.alpha != null) {
			// debugAlpha(event.alpha);
			// debugBeta(event.beta!);
			// debugGamma(event.gamma!);
			if (event.webkitCompassHeading != null) {
				debugCompassHeading(event.webkitCompassHeading);
				this._absoluteY = event.webkitCompassHeading; // - this._currentAngle; //_modAlpha(event.webkitCompassHeading + event.alpha);
				debugYOffset(this._yOffset());
				// this._setAbsoluteDelta(event.webkitCompassHeading, event.alpha);
				// this._useStartAbsoluteAlpha = false;
			}
		}

		if (event.absolute != null) {
			debugAbsoluteA(event.absolute);
		}
	}
	private _yOffset() {
		if (this._absoluteY == null) {
			return 0;
		}
		return -this._absoluteY + 1 * this._currentAngle;
	}
	onDeviceOrientationAbsoluteChangeEvent(event: DeviceOrientationEventExtended) {
		if (event.alpha != null) {
			// this._absoluteY = event.alpha;
			// this._setAbsoluteDelta(_modAlpha(event.alpha), this.lastDeviceOrientationEvent?.alpha);
		}
		if (event.absolute != null) {
			debugAbsoluteB(event.absolute);
		}
	}
	// private _lerpFactor() {
	// 	const now = performance.now();
	// 	const updatedAt = this._lastAbsolutedAlphaDeltaUpdatedAt != null ? this._lastAbsolutedAlphaDeltaUpdatedAt : now;
	// 	const x = (now - updatedAt) / this.absoluteUpdateFrequency;
	// 	return fit01(smootherstep(x, 0, 1), 0.0001, 0.01);
	// }
	// private _setAbsoluteDelta(absoluteAlpha: number | null | undefined, lastAlpha: number | null | undefined) {
	// 	const now = performance.now();
	// 	if (
	// 		lastAlpha != null &&
	// 		absoluteAlpha != null &&
	// 		(this._lastAbsolutedAlphaDeltaUpdatedAt == null ||
	// 			now - this._lastAbsolutedAlphaDeltaUpdatedAt > this.absoluteUpdateFrequency)
	// 	) {
	// 		this._lastAbsoluteAlphaDelta = absoluteAlpha - lastAlpha;
	// 		if (this._startAbsoluteAlphaDelta == null) {
	// 			this._startAbsoluteAlphaDelta = this._lastAbsoluteAlphaDelta;
	// 			debugStartAlphaAbsolute(this._startAbsoluteAlphaDelta);
	// 		}

	// 		this._lastAbsolutedAlphaDeltaUpdatedAt = now;
	// 		debugAlphaAbsolute(this._lastAbsoluteAlphaDelta);
	// 	}
	// }
	onScreenOrientationChangeEvent() {
		this.screenOrientation = window.orientation || 0;
	}
	private _bound = {
		onDeviceOrientationChangeEvent: this.onDeviceOrientationChangeEvent.bind(this),
		onDeviceOrientationAbsoluteChangeEvent: this.onDeviceOrientationAbsoluteChangeEvent.bind(this),
		onScreenOrientationChangeEvent: this.onScreenOrientationChangeEvent.bind(this),
	};
	connect() {
		this.onScreenOrientationChangeEvent(); // run once on load

		const requestPermission = (
			window.DeviceOrientationEvent as unknown as DeviceOrientationEventExtended
		)?.requestPermission?.bind(window.DeviceOrientationEvent);

		if (requestPermission && typeof requestPermission === 'function') {
			// iOS 13+
			requestPermission()
				.then((response) => {
					if (response == 'granted') {
						this._addEventListeners();
					}
				})
				.catch(function (error: Error) {
					console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);
				});
		} else {
			this._addEventListeners();
		}
	}
	// private _useOrientationAbsolute() {
	// 	return !CoreUserAgent.isiOS();
	// }
	private _addEventListeners() {
		window.addEventListener('orientationchange', this._bound.onScreenOrientationChangeEvent);
		window.addEventListener('deviceorientationabsolute', this._bound.onDeviceOrientationAbsoluteChangeEvent);
		window.addEventListener('deviceorientation', this._bound.onDeviceOrientationChangeEvent);
		this.enabled = true;
	}

	disconnect() {
		window.removeEventListener('orientationchange', this._bound.onScreenOrientationChangeEvent);
		window.removeEventListener('deviceorientationabsolute', this._bound.onDeviceOrientationAbsoluteChangeEvent);
		window.removeEventListener('deviceorientation', this._bound.onDeviceOrientationChangeEvent);

		this.enabled = false;
	}

	update() {
		if (this.enabled === false) return;

		const event = this.lastDeviceOrientationEvent;
		// const eventAbsolute = this.lastDeviceOrientationAbsoluteEvent;

		if (event) {
			_setQuaternion(event.alpha, event.beta, event.gamma, this.screenOrientation, _qTarget);
			// _eulerTarget.setFromQuaternion(_qTarget);
			// debugEulerX(MathUtils.radToDeg(_eulerTarget.x));
			// debugEulerY(MathUtils.radToDeg(_eulerTarget.y));
			// debugEulerZ(MathUtils.radToDeg(_eulerTarget.z));

			// _eulerTarget2.copy(_eulerTarget);
			// _eulerTarget2.y = MathUtils.degToRad(this._yOffset);
			// this.object.quaternion.setFromEuler(_eulerTarget2);

			_matrix.makeRotationFromQuaternion(_qTarget); //.premultiply(_qOffset);
			// this.object.quaternion.copy(_qTarget); //.premultiply(_qOffset);
			// this.object.updateMatrixWorld(true);
			// this.object.localToWorld(_localPos.set(0, 0, -1));
			_localPos.set(1, 0, 0).applyMatrix4(_matrix);
			_localPos.y = 0;
			_localPos.normalize();
			debugX(_localPos.x);
			debugZ(_localPos.z);
			_localPos2D.set(_localPos.x, _localPos.z);
			this._currentAngle = MathUtils.radToDeg(_localPos2D.angle()); //getYAngle(_localPos.x, _localPos.z);
			debugEulerY(this._currentAngle);

			_qOffset.setFromAxisAngle(_y, MathUtils.degToRad(this._yOffset()));
			this.quaternion.copy(_qOffset).multiply(_qTarget);
			// this.quaternion.setFromAxisAngle(_y, MathUtils.degToRad(this._yOffset));

			// this.object.rotateY(-MathUtils.degToRad(this._yOffset));
			// const _alpha = 1 * (event.alpha != null ? event.alpha : 0); // Z
			// // if (this._lastAbsoluteAlphaDelta != null && this._startAbsoluteAlphaDelta != null) {
			// // 	this.alphaOffset =
			// // 		0 *
			// // 		lerp(
			// // 			this.alphaOffset,
			// // 			this._lastAbsoluteAlphaDelta -
			// // 				(this._useStartAbsoluteAlpha ? this._startAbsoluteAlphaDelta : 0),
			// // 			this._lerpFactor()
			// // 		);
			// // 	debugDelta(this.alphaOffset);
			// // }

			// const alpha = MathUtils.degToRad(_alpha - this.alphaOffset); // Z

			// const beta = event.beta != null ? MathUtils.degToRad(event.beta) : 0; // X'

			// const gamma = event.gamma != null ? MathUtils.degToRad(event.gamma) : 0; // Y''

			// const orient = this.screenOrientation ? MathUtils.degToRad(this.screenOrientation) : 0; // O

			// setObjectQuaternion(this.object.quaternion, alpha, beta, gamma, orient);

			if (8 * (1 - this.lastQuaternion.dot(this.quaternion)) > EPS) {
				this.lastQuaternion.copy(this.quaternion);
				this.dispatchEvent(_changeEvent);
			}
		}
	}

	dispose() {
		this.disconnect();
	}
}
