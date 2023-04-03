import {Object3D, Texture, Vector4} from 'three';
import {computerVisionValidSource} from '../../core/computerVision/Common';
import {CoreComputerVisionFace} from '../../core/computerVision/face/CoreComputerVisionFace';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {touchTrackedObject, getOrCreateTrackedObjectRef} from '../../core/reactivity/TrackingReactivity';
import {ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';

//
//
// TRACK
//
//
export class trackFace extends ObjectNamedFunction1<[Texture]> {
	static override type() {
		return 'trackFace';
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
		CoreComputerVisionFace.trackMedia(object3D, source);
		touchTrackedObject(object3D);
	}
}

export class trackFaceGetLandmarks extends ObjectNamedFunction2<[number, Vector4[]]> {
	static override type() {
		return 'trackFaceGetLandmarks';
	}
	func(object3D: Object3D, faceIndex: number, target: Vector4[]): Vector4[] {
		dummyReadRefVal(getOrCreateTrackedObjectRef(object3D).value);

		const results = CoreComputerVisionFace.trackerResults(object3D);
		const vectorArray = results[faceIndex].multiFaceLandmarks;
		let i = 0;
		for (let src of vectorArray) {
			target[i].copy(src);
			i++;
		}
		return target;
	}
}
