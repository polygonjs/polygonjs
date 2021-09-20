import {CATEGORY_EVENT} from './Category';

import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';

export interface EventNodeChildrenMap {
	cameraMapControls: CameraOrbitControlsEventNode;
}

import {PolyEngine} from '../../../Poly';
export class EventRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
	}
}
