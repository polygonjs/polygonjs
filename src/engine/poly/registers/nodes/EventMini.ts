import {CATEGORY_EVENT} from './Category';

import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
import {FirstPersonControlsEventNode} from '../../../nodes/event/FirstPersonControls';

export interface EventNodeChildrenMap {
	cameraMapControls: CameraOrbitControlsEventNode;
	firstPersonControls: FirstPersonControlsEventNode;
}

import {PolyEngine} from '../../../Poly';
export class EventRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(FirstPersonControlsEventNode, CATEGORY_EVENT.CAMERA);
	}
}
