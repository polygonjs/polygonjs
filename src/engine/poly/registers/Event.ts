import {CATEGORY_EVENT} from './Category';

import {CameraMapControlsEventNode} from '../../nodes/event/CameraMapControls';
import {CameraOrbitControlsEventNode} from '../../nodes/event/CameraOrbitControls';

export interface EventNodeChildrenMap {
	camera_orbit_controls: CameraMapControlsEventNode;
	camera_map_controls: CameraOrbitControlsEventNode;
}

import {Poly} from '../../Poly';
export class EventRegister {
	static run(poly: Poly) {
		poly.register_node(CameraMapControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
	}
}
