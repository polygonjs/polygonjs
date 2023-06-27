/*

This table summarizes the requirements/quirks of the different browsers and devices for deviceorientation controls

					| https required	| start orientation consistent	| permission required
					|					|
android + chrome:	| yes				| yes							| no
anroid + firefox:	| no				| no							| no
ios + safari:		| yes				| no							| yes
ios + firefox:		| ?					| ?								| ?
ios + chrome:		| yes				| no							| yes


*/

import {Quaternion, Vector3} from 'three';
import {NamedFunction1} from './_Base';
import {DeviceOrientationControls} from '../../core/camera/controls/DeviceOrientationControls';
import {PolyScene} from '../scene/PolyScene';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {CoreUserAgent} from '../../core/UserAgent';

// const ROTATION_ORDER = 'YXZ';
// const magicWindowAbsoluteEuler = new Euler();
// const magicWindowDeltaEuler = new Euler();
const compensateQuat = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
// compensate for the inconsistency in rotation when starting in landscape vs starting in portrait,
// but only if we are in landscape, and NOT in android + chrome
const compensateRotation = CoreUserAgent.isLandscape() && !(CoreUserAgent.isAndroid() && CoreUserAgent.isChrome());
class DeviceOrientationControlsHandler {
	// private _dummyObject = new Object3D();
	private _lastUpdatedFrame = -1;
	private _controls: DeviceOrientationControls | undefined;
	// private previousMagicWindowYaw: number | undefined;

	constructor(public readonly scene: PolyScene) {
		// this._controls = new DeviceOrientationControls();
	}
	update() {
		const currentFrame = this.scene.frame();
		if (currentFrame == this._lastUpdatedFrame) {
			return;
		}
		// the controls are created in the update method,
		// instead of the constructor, so that
		// it does not get created until the scene plays.
		// This allows loading the scene with autoPlay=false,
		// and only start playing once DeviceOrientationEvent permission has been granted.
		this._controls = this._controls || new DeviceOrientationControls();
		if (this._controls.enabled) {
			this._controls.update();
			// if (compensateRotation) {
			// 	this._compensate();
			// }
		}
		this._lastUpdatedFrame = currentFrame;
	}
	quaternion(target: Quaternion) {
		if (!this._controls) {
			return;
		}
		this.update();
		target.copy(this._controls.quaternion);
		if (compensateRotation) {
			target.premultiply(compensateQuat);
			// target.setFromEuler(magicWindowDeltaEuler, false);
		} else {
			// target.copy(this._dummyObject.quaternion);
		}
	}
	// from aframe look-controls .updateMagicWindowOrientation()
	// protected _compensate() {
	// magicWindowAbsoluteEuler.setFromQuaternion(this._dummyObject.quaternion, ROTATION_ORDER);
	// if (!this.previousMagicWindowYaw && magicWindowAbsoluteEuler.y !== 0) {
	// 	this.previousMagicWindowYaw = magicWindowAbsoluteEuler.y;
	// }
	// if (this.previousMagicWindowYaw) {
	// 	magicWindowDeltaEuler.x = magicWindowAbsoluteEuler.x;
	// 	magicWindowDeltaEuler.y += magicWindowAbsoluteEuler.y - this.previousMagicWindowYaw;
	// 	magicWindowDeltaEuler.z = magicWindowAbsoluteEuler.z;
	// 	this.previousMagicWindowYaw = magicWindowAbsoluteEuler.y;
	// }
	// }
}
let _handler: DeviceOrientationControlsHandler | undefined;

export class deviceOrientation extends NamedFunction1<[Quaternion]> {
	static override type() {
		return 'deviceOrientation';
	}
	func(target: Quaternion): Quaternion {
		// force time dependency
		dummyReadRefVal(this.timeController.timeUniform().value);
		_handler = _handler || new DeviceOrientationControlsHandler(this.scene);
		_handler.quaternion(target);
		return target;
	}
}
