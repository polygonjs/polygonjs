import {CATEGORY_EVENT} from './Category';

import {AnimationMultiCacheEventNode} from '../../../nodes/event/AnimationMultiCache';
import {CameraMapControlsEventNode} from '../../../nodes/event/CameraMapControls';
import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
import {CodeEventNode} from '../../../nodes/event/Code';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {AnyEventNode} from '../../../nodes/event/Any';
import {RaycastEventNode} from '../../../nodes/event/Raycast';
import {SceneEventNode} from '../../../nodes/event/Scene';

export interface EventNodeChildrenMap {
	animation_multi_cache: AnimationMultiCacheEventNode;
	camera_orbit_controls: CameraMapControlsEventNode;
	camera_map_controls: CameraOrbitControlsEventNode;
	code: CodeEventNode;
	mouse: MouseEventNode;
	any: AnyEventNode;
	raycast: RaycastEventNode;
	scene: SceneEventNode;
}

import {Poly} from '../../../Poly';
export class EventRegister {
	static run(poly: Poly) {
		poly.register_node(AnimationMultiCacheEventNode, CATEGORY_EVENT.ANIMATION);
		poly.register_node(CameraMapControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CodeEventNode, CATEGORY_EVENT.ADVANCED);
		poly.register_node(MouseEventNode, CATEGORY_EVENT.INPUT);
		poly.register_node(AnyEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(RaycastEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(SceneEventNode, CATEGORY_EVENT.INPUT);
	}
}
