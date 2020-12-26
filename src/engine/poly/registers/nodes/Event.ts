import {CATEGORY_EVENT} from './Category';

import {AnimationEventNode} from '../../../nodes/event/Animation';
import {AnyEventNode} from '../../../nodes/event/Any';
import {ButtonEventNode} from '../../../nodes/event/Button';
import {CameraDeviceOrientationControlsEventNode} from '../../../nodes/event/CameraDeviceOrientationControls';
import {CameraMapControlsEventNode} from '../../../nodes/event/CameraMapControls';
import {CameraNavigationBeaconsEventNode} from '../../../nodes/event/CameraNavigationBeacons';
import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
// import {CodeEventNode} from '../../../nodes/event/Code';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
import {LimitEventNode} from '../../../nodes/event/Limit';
import {MessageEventNode} from '../../../nodes/event/Message';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {NodeCookEventNode} from '../../../nodes/event/NodeCook';
import {NullEventNode} from '../../../nodes/event/Null';
import {PointerEventNode} from '../../../nodes/event/Pointer';
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
	cameraDeviceOrientationControls: CameraDeviceOrientationControlsEventNode;
	cameraMapControls: CameraOrbitControlsEventNode;
	cameraNavigationBeacons: CameraNavigationBeaconsEventNode;
	cameraOrbitControls: CameraMapControlsEventNode;
	// code: CodeEventNode;
	keyboard: KeyboardEventNode;
	limit: LimitEventNode;
	message: MessageEventNode;
	mouse: MouseEventNode;
	nodeCook: NodeCookEventNode;
	null: NullEventNode;
	pointer: PointerEventNode;
	raycast: RaycastEventNode;
	scene: SceneEventNode;
	setFlag: SetFlagEventNode;
	setParam: SetParamEventNode;
	sequence: SequenceEventNode;
	timer: TimerEventNode;
	viewer: ViewerEventNode;
}

import {Poly} from '../../../Poly';
export class EventRegister {
	static run(poly: Poly) {
		poly.registerNode(AnimationEventNode, CATEGORY_EVENT.ANIMATION);
		poly.registerNode(AnyEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(ButtonEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(CameraDeviceOrientationControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(CameraMapControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(CameraNavigationBeaconsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		// poly.registerNode(CodeEventNode, CATEGORY_EVENT.ADVANCED);
		poly.registerNode(KeyboardEventNode, CATEGORY_EVENT.INPUT);
		poly.registerNode(LimitEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(MessageEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(MouseEventNode, CATEGORY_EVENT.INPUT);
		poly.registerNode(NodeCookEventNode, CATEGORY_EVENT.INPUT);
		poly.registerNode(NullEventNode, CATEGORY_EVENT.INPUT);
		poly.registerNode(PointerEventNode, CATEGORY_EVENT.INPUT);
		poly.registerNode(RaycastEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(SceneEventNode, CATEGORY_EVENT.INPUT);
		poly.registerNode(SetFlagEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(SetParamEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(SequenceEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(TimerEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(ViewerEventNode, CATEGORY_EVENT.MISC);
	}
}
