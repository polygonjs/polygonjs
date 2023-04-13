import {Object3D, Texture, Vector3, Vector4} from 'three';
import {computerVisionValidSource} from '../../core/computerVision/Common';
import {CoreComputerVisionHandIndex} from '../../core/computerVision/hand/Common';
import {CoreComputerVisionHand} from '../../core/computerVision/hand/CoreComputerVisionHand';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {touchTrackedObject, getOrCreateTrackedObjectRef} from '../../core/reactivity/TrackingReactivity';
import {NamedFunction2, ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';

const tmpV4 = new Vector4();
//
//
// TRACK
//
//
export class trackHand extends ObjectNamedFunction1<[Texture]> {
	static override type() {
		return 'trackHand';
	}
	func(object3D: Object3D, texture: Texture): void {
		if (!texture) {
			// console.warn('no texture');
			return;
		}
		const source = computerVisionValidSource(texture);
		if (!source) {
			// console.warn('source not valid for tracking');
			return;
		}
		CoreComputerVisionHand.trackMedia(object3D, source);
		touchTrackedObject(object3D);
	}
}

export class trackHandGetNormalizedLandmarks extends ObjectNamedFunction2<[number, Vector4[]]> {
	static override type() {
		return 'trackHandGetNormalizedLandmarks';
	}
	func(object3D: Object3D, handIndex: number, target: Vector4[]): Vector4[] {
		dummyReadRefVal(getOrCreateTrackedObjectRef(this.timeController, object3D).value);

		const results = CoreComputerVisionHand.trackerResults(object3D);
		const vectorArray = results[handIndex].multiHandLandmarks;
		let i = 0;
		for (let src of vectorArray) {
			target[i].copy(src);
			i++;
		}
		return target;
	}
}

export class trackHandGetWorldLandmarks extends ObjectNamedFunction2<[number, Vector4[]]> {
	static override type() {
		return 'trackHandGetWorldLandmarks';
	}
	func(object3D: Object3D, handIndex: number, target: Vector4[]): Vector4[] {
		dummyReadRefVal(getOrCreateTrackedObjectRef(this.timeController, object3D).value);

		const results = CoreComputerVisionHand.trackerResults(object3D);
		const vectorArray = results[handIndex].multiHandWorldLandmarks;
		let i = 0;
		for (let src of vectorArray) {
			target[i].copy(src);
			i++;
		}
		return target;
	}
}

//
//
// GET
//
//

export class getTrackedHandThumbDirection extends NamedFunction2<[Vector4[], Vector3]> {
	static override type() {
		return 'getTrackedHandThumbDirection';
	}
	func(values: Vector4[], target: Vector3): Vector3 {
		tmpV4.copy(values[CoreComputerVisionHandIndex.THUMB_TIP]).sub(values[CoreComputerVisionHandIndex.THUMB_MCP]);
		target.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
		return target;
	}
}
export class getTrackedHandIndexDirection extends NamedFunction2<[Vector4[], Vector3]> {
	static override type() {
		return 'getTrackedHandIndexDirection';
	}
	func(values: Vector4[], target: Vector3): Vector3 {
		tmpV4
			.copy(values[CoreComputerVisionHandIndex.INDEX_FINGER_TIP])
			.sub(values[CoreComputerVisionHandIndex.INDEX_FINGER_DIP]);
		target.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
		return target;
	}
}
export class getTrackedHandMiddleDirection extends NamedFunction2<[Vector4[], Vector3]> {
	static override type() {
		return 'getTrackedHandMiddleDirection';
	}
	func(values: Vector4[], target: Vector3): Vector3 {
		tmpV4
			.copy(values[CoreComputerVisionHandIndex.MIDDLE_FINGER_TIP])
			.sub(values[CoreComputerVisionHandIndex.MIDDLE_FINGER_DIP]);
		target.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
		return target;
	}
}
export class getTrackedHandRingDirection extends NamedFunction2<[Vector4[], Vector3]> {
	static override type() {
		return 'getTrackedHandRingDirection';
	}
	func(values: Vector4[], target: Vector3): Vector3 {
		tmpV4
			.copy(values[CoreComputerVisionHandIndex.RING_FINGER_TIP])
			.sub(values[CoreComputerVisionHandIndex.RING_FINGER_DIP]);
		target.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
		return target;
	}
}
export class getTrackedHandPinkyDirection extends NamedFunction2<[Vector4[], Vector3]> {
	static override type() {
		return 'getTrackedHandPinkyDirection';
	}
	func(values: Vector4[], target: Vector3): Vector3 {
		tmpV4.copy(values[CoreComputerVisionHandIndex.PINKY_TIP]).sub(values[CoreComputerVisionHandIndex.PINKY_DIP]);
		target.set(tmpV4.x, tmpV4.y, tmpV4.z).normalize();
		return target;
	}
}
