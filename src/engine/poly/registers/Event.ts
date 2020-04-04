import {CATEGORY_EVENT} from './Category';

import {CameraMapControlsEventNode} from '../../nodes/event/CameraMapControls';
import {CameraOrbitControlsEventNode} from '../../nodes/event/CameraOrbitControls';
import {CodeEventNode} from '../../nodes/event/Code';
import {MouseEventNode} from '../../nodes/event/MouseEvent';
import {PassEventNode} from '../../nodes/event/PassEvent';

export interface EventNodeChildrenMap {
	camera_orbit_controls: CameraMapControlsEventNode;
	camera_map_controls: CameraOrbitControlsEventNode;
	code: CodeEventNode;
	mouse_event: MouseEventNode;
	pass_event: PassEventNode;
}

import {Poly} from '../../Poly';
export class EventRegister {
	static run(poly: Poly) {
		poly.register_node(CameraMapControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CodeEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(MouseEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(PassEventNode, CATEGORY_EVENT.MISC);
	}
}
