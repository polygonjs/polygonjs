/**
 * adapted from threejs r133 DeviceOrientationControls
 */

import {Euler, EventDispatcher, MathUtils, Quaternion, Vector2, Vector3, Matrix4} from 'three';
import {smootherstep, fit01, clamp} from '../../math/_Module';
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
const _qOffset2 = new Quaternion();
const _matrix = new Matrix4();
const _localPos = new Vector3();
const _localPos2D = new Vector2();
const _changeEvent = {type: 'change'};

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
	const _alpha1 = _alpha != null ? _alpha : 0; // Z

	const alpha = MathUtils.degToRad(_alpha1 /* - this.alphaOffset*/); // Z

	const beta = _beta != null ? MathUtils.degToRad(_beta) : 0; // X'

	const gamma = _gamma != null ? MathUtils.degToRad(_gamma) : 0; // Y''

	const orient = _screenOrientation ? MathUtils.degToRad(_screenOrientation) : 0; // O

	setObjectQuaternion(target, alpha, beta, gamma, orient);
}

function lerp(src: number, dest: number, lerp: number) {
	return lerp * dest + (1 - lerp) * src;
}
// function _modAlpha(n: number): number {
// 	return mod(n, 360);
// }
// function compassHeadingOrAlpha(e: DeviceOrientationEventExtended): number {
// 	return e.webkitCompassHeading != null ? e.webkitCompassHeading : e.alpha != null ? e.alpha : 0;
// }
const DURATION_WITHOUT_SMOOTH = 3000;

export class DeviceOrientationControls extends EventDispatcher {
	public enabled: boolean = true;
	private _screenOrientation: number | undefined;
	private lastQuaternion = new Quaternion();
	public readonly quaternion = new Quaternion();
	private lastDeviceOrientationEvent: DeviceOrientationEventExtended | undefined;
	public absoluteUpdateFrequency = 5000;
	protected _currentAngle = 0;
	private __absoluteY: number | undefined;
	// private _yOffset: number = 0;
	private __absoluteYUpdatedAt: number | undefined;
	private _startTime = performance.now();
	private _smoothAmount = 1;
	constructor() {
		super();

		if (window.isSecureContext === false) {
			console.error(
				'THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)'
			);
		}
		// this._startTime = performance.now();

		this.connect();
	}
	setSmoothAmount(smoothAmount: number) {
		this._smoothAmount = clamp(smoothAmount, 0, 1);
	}
	onDeviceOrientationChangeEvent(event: DeviceOrientationEventExtended) {
		this.lastDeviceOrientationEvent = event;
		if (event.alpha != null) {
			if (event.webkitCompassHeading != null) {
				this._setAbsoluteY(event.webkitCompassHeading);
			}
		}
	}
	onDeviceOrientationAbsoluteChangeEvent(event: DeviceOrientationEventExtended) {
		if (event.alpha != null && event.beta != null) {
			// TODO: try and see if .beta could be viable when in landscape
			this._setAbsoluteY(Math.abs(event.alpha - 360));
		}
	}
	private _orientation() {
		const screenAngle: number | undefined = window?.screen?.orientation?.angle;
		const orientation = this._screenOrientation != null ? this._screenOrientation : screenAngle ? screenAngle : 0;
		// debugOrientation(orientation);
		return orientation;
	}
	private _setAbsoluteY(y: number) {
		this.__absoluteY = y;
		const now = performance.now();
		if (this.__absoluteYUpdatedAt == null || now - this.__absoluteYUpdatedAt > this.absoluteUpdateFrequency) {
			this.__absoluteYUpdatedAt = now;
			this.__absoluteY = y;
		}
	}
	private _absoluteY() {
		if (this.__absoluteY == null) {
			return undefined;
		}
		const y = this.__absoluteY + this._orientation();
		// debugAbsoluteY(y);
		return y;
	}
	private _targetYOffset() {
		const y = this._absoluteY();
		if (y == null) {
			return 0;
		}
		return -y + this._currentAngle;
	}

	protected _lerpFactor() {
		// lerp factor should be 1 in the beginning,
		// for the first X seconds
		const now = performance.now();
		const timeSinceStart = now - this._startTime;
		if (timeSinceStart < DURATION_WITHOUT_SMOOTH) {
			return 1;
		}
		//
		const updatedAt = this.__absoluteYUpdatedAt != null ? this.__absoluteYUpdatedAt : now;
		const x = (now - updatedAt) / this.absoluteUpdateFrequency;
		const lerpFactor = fit01(smootherstep(x, 0, 1), 0.001, 0.01);
		return lerp(1, lerpFactor, this._smoothAmount);
	}
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
		this._screenOrientation = window.orientation || 0;
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

		if (event) {
			// if (event.alpha) {
			// 	debugAlpha(event.alpha);
			// }

			_setQuaternion(event.alpha, event.beta, event.gamma, this._orientation(), _qTarget);

			_matrix.makeRotationFromQuaternion(_qTarget); //.premultiply(_qOffset);

			_localPos.set(1, 0, 0).applyMatrix4(_matrix);
			_localPos.y = 0;
			_localPos.normalize();
			_localPos2D.set(_localPos.x, _localPos.z);
			this._currentAngle = MathUtils.radToDeg(_localPos2D.angle()); //getYAngle(_localPos.x, _localPos.z);

			// compensate Y rotation for compass
			const targetY = this._targetYOffset();
			const lerpFactor = this._lerpFactor();
			// this._yOffset = lerp(this._yOffset, targetY, lerpFactor);
			// if (this._yOffsetHasReachedTargetYOnce == false && Math.abs(this._yOffset - targetY) < 5) {
			// 	this._yOffsetHasReachedTargetYOnce = true;
			// }
			_qOffset.setFromAxisAngle(_y, MathUtils.degToRad(targetY));
			_qOffset2.slerp(_qOffset, lerpFactor);
			this.quaternion.copy(_qOffset2).multiply(_qTarget);

			// dispatch event if quaternion has changed enough
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
