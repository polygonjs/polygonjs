/**
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

import {EventDispatcher, Quaternion} from 'three';
import {
	ScreenOrientation,
	setQuaternionFromEvent,
	EPS,
	CHANGE_EVENT,
	DeviceOrientationEventExtended,
	blendQuaternionToAbsoluteYAngle,
	quaternionYAngle,
	yAngleFromEvent,
	PI_DEG,
	PI_DEG2,
} from './DeviceOrientationControlsUtils';
import {screenOrientation} from '../../UserAgent';
// import {mountDebugElement, debug} from './DeviceOrientationControlsDebug';
export const DEFAULT_SMOOTH_AMOUNT = 0.01;
export const COMPASS_READJUST_TIMESTEP_START = 1000;
export const COMPASS_READJUST_TIMESTEP_MAX = 5000;
export const COMPASS_READJUST_TIMESTEP_INCREMENT = 1000;

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
class DeviceOrientationControls extends EventDispatcher<{change: any}> {
	protected _relativeQuaternion = new Quaternion();
	protected _blendedQuaternion = new Quaternion();
	public enabled = true;
	protected _relativeEvent: Partial<DeviceOrientationEvent> = {alpha: 0, beta: 0, gamma: 0};
	protected _screenOrientation: ScreenOrientation = 0;
	public alphaOffset = 0; // radians
	protected _smoothAmount = DEFAULT_SMOOTH_AMOUNT;
	protected _yAngleOffset: number | undefined;
	protected _currentYAngleOffset: number = 0;
	protected _targetYAngleOffset: number = 0;
	// _absoluteYAngles was for an attempt to gather all absolute angles
	// and average them. But this results in unwanted behaviour when we do large movements,
	// we end up averaging with values which are not where we are looking at now.
	// protected _absoluteYAngles: number[] = [];
	protected _absoluteYAngle: number | undefined;
	public _compassReadjustTimestep = COMPASS_READJUST_TIMESTEP_START; // in milliseconds
	private _absoluteYAngleProcessedAt = -1;

	constructor() {
		super();
		// mountDebugElement();

		this.connect();
	}

	private onDeviceOrientationChangeEvent(event: DeviceOrientationEvent): void {
		this._relativeEvent = event;
		// webkitCompassHeading is defined on iOS, but not on Android
		const webkitCompassHeading = (event as DeviceOrientationEventExtended).webkitCompassHeading;
		if (webkitCompassHeading != null) {
			// debug({webkitCompassHeading});
			// webkitCompassHeading will be different depending on the device orientation,
			// so we need to take it into account. Since the values are:
			// 0 when the device is in portrait mode
			// -90 when the device is in landscape mode with the top of the device pointing to the right
			// +90 when the device is in landscape mode with the top of the device pointing to the left
			// we can simply add it to webkitCompassHeading
			this._setAbsoluteAngleY(webkitCompassHeading + this._screenOrientation);
		}
	}
	private onDeviceOrientationAbsoluteChangeEvent(event: DeviceOrientationEvent): void {
		if (event.alpha == null) {
			return;
		}
		const yAngleAbsolute = yAngleFromEvent(event, this._screenOrientation);
		this._setAbsoluteAngleY(yAngleAbsolute);
	}
	private _setAbsoluteAngleY(y: number) {
		this._absoluteYAngle = y;
	}

	private onScreenOrientationChangeEvent(): void {
		this._screenOrientation = screenOrientation();
		this._absoluteYAngleProcessedAt = -1;
	}
	private _bound = {
		onDeviceOrientationChangeEvent: this.onDeviceOrientationChangeEvent.bind(this),
		onDeviceOrientationAbsoluteChangeEvent: this.onDeviceOrientationAbsoluteChangeEvent.bind(this),
		onScreenOrientationChangeEvent: this.onScreenOrientationChangeEvent.bind(this),
	};
	connect(): void {
		this.onScreenOrientationChangeEvent(); // run once on load

		// iOS 13+

		if (
			globalThis.DeviceOrientationEvent !== undefined &&
			// @ts-ignore
			typeof globalThis.DeviceOrientationEvent.requestPermission === 'function'
		) {
			// @ts-ignore
			globalThis.DeviceOrientationEvent.requestPermission()
				.then((response: any) => {
					if (response == 'granted') {
						globalThis.addEventListener('orientationchange', this._bound.onScreenOrientationChangeEvent);
						globalThis.addEventListener('deviceorientation', this._bound.onDeviceOrientationChangeEvent);
						globalThis.addEventListener(
							'deviceorientationabsolute' as any,
							this._bound.onDeviceOrientationAbsoluteChangeEvent
						);
					}
				})
				.catch((error: any) => {
					console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);
				});
		} else {
			globalThis.addEventListener('orientationchange', this._bound.onScreenOrientationChangeEvent);
			globalThis.addEventListener('deviceorientation', this._bound.onDeviceOrientationChangeEvent);
			globalThis.addEventListener(
				'deviceorientationabsolute' as any,
				this._bound.onDeviceOrientationAbsoluteChangeEvent
			);
		}

		this.enabled = true;
	}

	disconnect(): void {
		globalThis.removeEventListener('orientationchange', this.onScreenOrientationChangeEvent);
		globalThis.removeEventListener('deviceorientation', this.onDeviceOrientationChangeEvent);

		this.enabled = false;
	}

	private lastQuaternion = new Quaternion();
	update(): void {
		if (this.enabled === false) return;

		setQuaternionFromEvent(this._relativeEvent, this._screenOrientation, this._relativeQuaternion);
		const currentYAngle = quaternionYAngle(this._relativeQuaternion);

		const now = performance.now();
		const timeSinceLastCompassReadjust = now - this._absoluteYAngleProcessedAt;
		const updateYAngleRequired =
			this._absoluteYAngleProcessedAt < 0 || timeSinceLastCompassReadjust > this._compassReadjustTimestep;
		if (updateYAngleRequired && this._absoluteYAngle != null) {
			this._targetYAngleOffset = this._absoluteYAngle - currentYAngle;
			// this._targetYAngleOffset = ensureDeltaLessThan2PI(this._absoluteYAngle, currentYAngle);
			if (Math.abs(this._targetYAngleOffset) > PI_DEG) {
				if (this._targetYAngleOffset > 0) {
					this._targetYAngleOffset -= PI_DEG2;
				} else {
					this._targetYAngleOffset += PI_DEG2;
				}
			}

			const delta = this._targetYAngleOffset - this._currentYAngleOffset;
			// this._targetYAngleOffset = ensureDeltaLessThan2PI(this._targetYAngleOffset, this._currentYAngleOffset);
			if (Math.abs(delta) > PI_DEG) {
				if (delta > 0) {
					this._targetYAngleOffset -= PI_DEG2;
				} else {
					this._targetYAngleOffset += PI_DEG2;
				}
			}

			this._absoluteYAngle = undefined;
			this._absoluteYAngleProcessedAt = now;
			// we readjust against the compass after 1 second initially,
			// and gradually increase the time between readjustments
			// by 1 second, until reaching 5 seconds
			this._compassReadjustTimestep = Math.min(
				this._compassReadjustTimestep + COMPASS_READJUST_TIMESTEP_INCREMENT,
				COMPASS_READJUST_TIMESTEP_MAX
			);
			// debug({timestep: this._compassReadjustTimestep});
		}

		// debug({smoothAmount: this._smoothAmount});
		this._currentYAngleOffset =
			(1 - this._smoothAmount) * this._currentYAngleOffset + this._smoothAmount * this._targetYAngleOffset;
		blendQuaternionToAbsoluteYAngle(this._relativeQuaternion, this._currentYAngleOffset, this._blendedQuaternion);

		if (8 * (1 - this.lastQuaternion.dot(this._blendedQuaternion)) > EPS) {
			this.lastQuaternion.copy(this._blendedQuaternion);
			this.dispatchEvent(CHANGE_EVENT);
		}
	}

	quaternion(target: Quaternion) {
		target.copy(this._blendedQuaternion);
	}
	setSmoothAmount(smoothAmount: number) {
		this._smoothAmount = smoothAmount;
	}

	public dispose = (): void => this.disconnect();
}

export {DeviceOrientationControls};
