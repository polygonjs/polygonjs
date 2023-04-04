import {NamedFunction1} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {Matrix4} from 'three';
import {Poly} from '../Poly';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {getOrCreateWebXRTrackerRef} from '../../core/reactivity/WebXRTrackedMarker';

export class getWebXRTrackedMarkerMatrix extends NamedFunction1<[Matrix4]> {
	static override type() {
		return 'getWebXRTrackedMarkerMatrix';
	}
	func(target: Matrix4): Matrix4 {
		const controller = Poly.thirdParty.markerTracking().controller();
		if (controller) {
			dummyReadRefVal(getOrCreateWebXRTrackerRef(0).value);
			controller.trackedMatrix(target);
		} else {
			target.identity();
		}
		return target;
	}
}
