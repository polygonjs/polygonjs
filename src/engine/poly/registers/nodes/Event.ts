import {CATEGORY_EVENT} from './Category';

import {AnimationTransformEventNode} from '../../../nodes/event/AnimationTransform';
import {CameraMapControlsEventNode} from '../../../nodes/event/CameraMapControls';
import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
import {CodeEventNode} from '../../../nodes/event/Code';
import {MouseEventNode} from '../../../nodes/event/MouseEvent';
import {PassEventNode} from '../../../nodes/event/PassEvent';
import {RaycastEventNode} from '../../../nodes/event/Raycast';
// import {RivetEventNode} from '../../../nodes/event/Rivet';
import {SceneEventNode} from '../../../nodes/event/SceneEvent';

export interface EventNodeChildrenMap {
	animation_transform: AnimationTransformEventNode;
	camera_orbit_controls: CameraMapControlsEventNode;
	camera_map_controls: CameraOrbitControlsEventNode;
	code: CodeEventNode;
	mouse_event: MouseEventNode;
	pass_event: PassEventNode;
	raycast: RaycastEventNode;
	// rivet: RivetEventNode;
	scene_event: SceneEventNode;
}

import {Poly} from '../../../Poly';
export class EventRegister {
	static run(poly: Poly) {
		poly.register_node(AnimationTransformEventNode, CATEGORY_EVENT.ANIMATION);
		poly.register_node(CameraMapControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CodeEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(MouseEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(PassEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(RaycastEventNode, CATEGORY_EVENT.MISC);
		// poly.register_node(RivetEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(SceneEventNode, CATEGORY_EVENT.MISC);
	}
}
