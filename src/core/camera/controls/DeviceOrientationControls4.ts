/**
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

import {EventDispatcher, Quaternion} from 'three';
import {
	ScreenOrientation,
	setQuaternionFromEvent,
	EPS,
	CHANGE_EVENT,
	screenOrientation,
	DeviceOrientationEventExtended,
	blendQuaternionToAbsoluteYAngle,
	quaternionYAngle,
	yAngleFromEvent,
	PI_DEG,
	PI_DEG2,
	// setQuaternionFromEventAbsolute,
	// blendRelativeToAbsoluteQuaternionOnYAxisOnly,
} from './DeviceOrientationControlsUtils';
import {mountDebugElement, debug} from './DeviceOrientationControlsDebug';
// import {arrayAverage} from '../../ArrayUtils';

class DeviceOrientationControls extends EventDispatcher {
	protected _relativeQuaternion = new Quaternion();
	// protected _absoluteQuaternion = new Quaternion();
	protected _blendedQuaternion = new Quaternion();
	public enabled = true;
	protected _relativeEvent: Partial<DeviceOrientationEvent> = {alpha: 0, beta: 0, gamma: 0};
	protected _screenOrientation: ScreenOrientation = 0;
	public alphaOffset = 0; // radians
	protected _smoothAmount = 0.02;
	protected _yAngleOffset: number | undefined;
	protected _currentYAngleOffset: number = 0;
	protected _targetYAngleOffset: number = 0;
	protected _absoluteYAngles: number[] = [];
	public _absoluteYAngleAccumulationDuration = 5000; // in milliseconds
	private _absoluteYAngleProcessedAt = -1;

	constructor() {
		super();
		mountDebugElement();
		// this.object = new Object3D();
		// this.object.rotation.reorder('YXZ');

		this.connect();
	}

	private onDeviceOrientationChangeEvent(event: DeviceOrientationEvent): void {
		this._relativeEvent = event;
		// webkitCompassHeading is defined on iOS, but not on Android
		const webkitCompassHeading = (event as DeviceOrientationEventExtended).webkitCompassHeading;
		// debug({webkitCompassHeading: (event as DeviceOrientationEventExtended).webkitCompassHeading});
		if (webkitCompassHeading != null) {
			// this._pushAbsoluteAngleY(webkitCompassHeading);
			debug({webkitCompassHeading});
			// webkitCompassHeading will be different depending on the device orientation,
			// so we need to take it into account. Since the values are:
			// 0 when the device is in portrait mode
			// -90 when the device is in landscape mode with the top of the device pointing to the right
			// +90 when the device is in landscape mode with the top of the device pointing to the left
			// we can simply add it to webkitCompassHeading
			this._pushAbsoluteAngleY(webkitCompassHeading + this._screenOrientation);
		}
		// if (event.alpha != null) {
		// 	// this._pushAbsoluteAngleY(webkitCompassHeading);
		// 	// debug({alpha: event.alpha, beta: event.beta!, gamma: event.gamma!});
		// 	this._pushAbsoluteAngleY(event.alpha);
		// }
		// if (isIOS()) {
		// 	this._absoluteEvent = event;
		// }
	}
	private onDeviceOrientationAbsoluteChangeEvent(event: DeviceOrientationEvent): void {
		if (event.alpha != null /*&& event.beta != null*/) {
			// TODO: try and see if .beta could be viable when in landscape
			// debug({alphaMinus360: Math.abs(event.alpha - 360)});
			// const modifiedAlpha = Math.abs(event.alpha - 360);
			// debug({alpha: event.alpha, beta: event.beta!, gamma: event.gamma!});
			const yAngleAbsolute = yAngleFromEvent(event, this._screenOrientation);
			// debug({yAngleAbsolute});
			this._pushAbsoluteAngleY(yAngleAbsolute);
			// this._pushAbsoluteAngleY(event.alpha);
		}
		// console.log('ABSOLUTE', {alpha: event.alpha, beta: event.beta, gamma: event.gamma});
		// if (!isIOS()) {
		// 	this._absoluteEvent = event;
		// }
	}
	private _pushAbsoluteAngleY(y: number) {
		this._absoluteYAngles.push(y);
	}

	private onScreenOrientationChangeEvent(): void {
		this._screenOrientation = screenOrientation();
		debug({screenOrientation: this._screenOrientation});
		this._absoluteYAngleProcessedAt = -1;
	}

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	private _bound = {
		onDeviceOrientationChangeEvent: this.onDeviceOrientationChangeEvent.bind(this),
		onDeviceOrientationAbsoluteChangeEvent: this.onDeviceOrientationAbsoluteChangeEvent.bind(this),
		onScreenOrientationChangeEvent: this.onScreenOrientationChangeEvent.bind(this),
	};
	connect(): void {
		this.onScreenOrientationChangeEvent(); // run once on load

		// iOS 13+

		if (
			window.DeviceOrientationEvent !== undefined &&
			// @ts-ignore
			typeof window.DeviceOrientationEvent.requestPermission === 'function'
		) {
			// @ts-ignore
			window.DeviceOrientationEvent.requestPermission()
				.then((response: any) => {
					if (response == 'granted') {
						window.addEventListener('orientationchange', this._bound.onScreenOrientationChangeEvent);
						window.addEventListener('deviceorientation', this._bound.onDeviceOrientationChangeEvent);
						window.addEventListener(
							'deviceorientationabsolute',
							this._bound.onDeviceOrientationAbsoluteChangeEvent
						);
					}
				})
				.catch((error: any) => {
					console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);
				});
		} else {
			window.addEventListener('orientationchange', this._bound.onScreenOrientationChangeEvent);
			window.addEventListener('deviceorientation', this._bound.onDeviceOrientationChangeEvent);
			window.addEventListener('deviceorientationabsolute', this._bound.onDeviceOrientationAbsoluteChangeEvent);
		}

		this.enabled = true;
	}

	disconnect(): void {
		window.removeEventListener('orientationchange', this.onScreenOrientationChangeEvent);
		window.removeEventListener('deviceorientation', this.onDeviceOrientationChangeEvent);

		this.enabled = false;
	}

	private lastQuaternion = new Quaternion();
	update(): void {
		if (this.enabled === false) return;

		setQuaternionFromEvent(
			this._relativeEvent,
			// this.alphaOffset,
			this._screenOrientation,
			this._relativeQuaternion
		);
		const currentYAngle = quaternionYAngle(this._relativeQuaternion);
		// debug({currentYAngle});

		const now = performance.now();
		const updateYAngleRequired =
			this._absoluteYAngleProcessedAt < 0 ||
			now - this._absoluteYAngleProcessedAt > this._absoluteYAngleAccumulationDuration;
		if (updateYAngleRequired && this._absoluteYAngles.length > 0) {
			const lastAbsoluteYAngle = this._absoluteYAngles[this._absoluteYAngles.length - 1]; //arrayAverage(this._absoluteYAngles);
			this._targetYAngleOffset = lastAbsoluteYAngle - currentYAngle;
			// debug({diff1: this._targetYAngleOffset});
			if (Math.abs(this._targetYAngleOffset) > PI_DEG) {
				if (this._targetYAngleOffset > 0) {
					this._targetYAngleOffset -= PI_DEG2;
				} else {
					this._targetYAngleOffset += PI_DEG2;
				}
			}

			// debug({diff2: this._targetYAngleOffset});
			const delta = this._targetYAngleOffset - this._currentYAngleOffset;
			if (Math.abs(delta) > PI_DEG) {
				if (delta > 0) {
					this._targetYAngleOffset -= PI_DEG2;
				} else {
					this._targetYAngleOffset += PI_DEG2;
				}
			}

			// debug({lastAbsoluteYAngle, targetYAngle: this._targetYAngleOffset});
			this._absoluteYAngles.length = 0;
			this._absoluteYAngleProcessedAt = now;
		}

		// if (this._averageYAngle != null) {
		this._currentYAngleOffset =
			(1 - this._smoothAmount) * this._currentYAngleOffset + this._smoothAmount * this._targetYAngleOffset;
		// debug({currentYAngleOffset: this._currentYAngleOffset});
		blendQuaternionToAbsoluteYAngle(this._relativeQuaternion, this._currentYAngleOffset, this._blendedQuaternion);
		// this._blendedQuaternion.slerp(this._absoluteQuaternion, this._smoothAmount);
		// debug({smoothAmount: this._smoothAmount});
		// } else {
		// this._blendedQuaternion.copy(this._relativeQuaternion);
		// }
		// setQuaternionFromEventRelative(
		// 	// this._relativeEvent,
		// 	this._absoluteEvent,
		// 	this.alphaOffset,
		// 	this._screenOrientation,
		// 	this._absoluteQuaternion
		// );
		// blendRelativeToAbsoluteQuaternionOnYAxisOnly(
		// 	this._relativeQuaternion,
		// 	this._absoluteQuaternion,
		// 	this._smoothAmount,
		// 	this._blendedQuaternion
		// );

		if (8 * (1 - this.lastQuaternion.dot(this._blendedQuaternion)) > EPS) {
			this.lastQuaternion.copy(this._blendedQuaternion);
			this.dispatchEvent(CHANGE_EVENT);
		}
	}

	quaternion(target: Quaternion) {
		target.copy(this._blendedQuaternion);
	}
	setSmoothAmount(smoothAmount: number) {
		// this._smoothAmount = smoothAmount;
	}

	public dispose = (): void => this.disconnect();
}

export {DeviceOrientationControls};
