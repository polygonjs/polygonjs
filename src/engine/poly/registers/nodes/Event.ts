import {CATEGORY_EVENT} from './Category';

import {AnimationEventNode} from '../../../nodes/event/Animation';
import {AnyEventNode} from '../../../nodes/event/Any';
import {ButtonEventNode} from '../../../nodes/event/Button';
import {CameraDeviceOrientationControlsEventNode} from '../../../nodes/event/CameraDeviceOrientationControls';
import {CameraMapControlsEventNode} from '../../../nodes/event/CameraMapControls';
import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
// import {CodeEventNode} from '../../../nodes/event/Code';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
import {LimitEventNode} from '../../../nodes/event/Limit';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {NodeCookEventNode} from '../../../nodes/event/NodeCook';
import {NullEventNode} from '../../../nodes/event/Null';
import {RaycastEventNode} from '../../../nodes/event/Raycast';
import {SceneEventNode} from '../../../nodes/event/Scene';
import {SetFlagEventNode} from '../../../nodes/event/SetFlag';
import {SetParamEventNode} from '../../../nodes/event/SetParam';
import {SequenceEventNode} from '../../../nodes/event/Sequence';
import {TimerEventNode} from '../../../nodes/event/Timer';
import {ViewerEventNode} from '../../../nodes/event/Viewer';

export interface EventNodeChildrenMap {
	animation: AnimationEventNode;
	any: AnyEventNode;
	button: ButtonEventNode;
	camera_device_orientation_controls: CameraDeviceOrientationControlsEventNode;
	camera_map_controls: CameraOrbitControlsEventNode;
	camera_orbit_controls: CameraMapControlsEventNode;
	// code: CodeEventNode;
	keyboard: KeyboardEventNode;
	limit: LimitEventNode;
	mouse: MouseEventNode;
	node_cook: NodeCookEventNode;
	null: NullEventNode;
	raycast: RaycastEventNode;
	scene: SceneEventNode;
	set_flag: SetFlagEventNode;
	set_param: SetParamEventNode;
	sequence: SequenceEventNode;
	timer: TimerEventNode;
	viewer: ViewerEventNode;
}

import {Poly} from '../../../Poly';
export class EventRegister {
	static run(poly: Poly) {
		poly.register_node(AnimationEventNode, CATEGORY_EVENT.ANIMATION);
		poly.register_node(AnyEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(ButtonEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(CameraDeviceOrientationControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CameraMapControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.register_node(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		// poly.register_node(CodeEventNode, CATEGORY_EVENT.ADVANCED);
		poly.register_node(KeyboardEventNode, CATEGORY_EVENT.INPUT);
		poly.register_node(LimitEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(MouseEventNode, CATEGORY_EVENT.INPUT);
		poly.register_node(NodeCookEventNode, CATEGORY_EVENT.INPUT);
		poly.register_node(NullEventNode, CATEGORY_EVENT.INPUT);
		poly.register_node(RaycastEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(SceneEventNode, CATEGORY_EVENT.INPUT);
		poly.register_node(SetFlagEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(SetParamEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(SequenceEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(TimerEventNode, CATEGORY_EVENT.MISC);
		poly.register_node(ViewerEventNode, CATEGORY_EVENT.MISC);
	}
}
