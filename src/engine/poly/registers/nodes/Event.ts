import {CATEGORY_EVENT} from './Category';

import {AnimationEventNode} from '../../../nodes/event/Animation';
import {AnimationsEventNode} from '../../../nodes/event/Animations';
import {AnyEventNode} from '../../../nodes/event/Any';
import {ButtonEventNode} from '../../../nodes/event/Button';
import {CameraDeviceOrientationControlsEventNode} from '../../../nodes/event/CameraDeviceOrientationControls';
import {CameraMapControlsEventNode} from '../../../nodes/event/CameraMapControls';
import {CameraNavigationBeaconsEventNode} from '../../../nodes/event/CameraNavigationBeacons';
import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
import {CopEventNode} from '../../../nodes/event/Cop';
import {DelayEventNode} from '../../../nodes/event/Delay';
// import {CodeEventNode} from '../../../nodes/event/Code';
import {EventsEventNode} from '../../../nodes/event/Events';
import {KeyboardEventNode} from '../../../nodes/event/Keyboard';
import {LimitEventNode} from '../../../nodes/event/Limit';
import {MaterialsEventNode} from '../../../nodes/event/Materials';
import {MessageEventNode} from '../../../nodes/event/Message';
import {MouseEventNode} from '../../../nodes/event/Mouse';
import {NodeCookEventNode} from '../../../nodes/event/NodeCook';
import {NullEventNode} from '../../../nodes/event/Null';
import {PointerEventNode} from '../../../nodes/event/Pointer';
import {PostProcessEventNode} from '../../../nodes/event/PostProcess';
import {RaycastEventNode} from '../../../nodes/event/Raycast';
import {RenderersEventNode} from '../../../nodes/event/Renderers';
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
	delay: DelayEventNode;
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

	// networks
	animations: AnimationsEventNode;
	cop: CopEventNode;
	events: EventsEventNode;
	materials: MaterialsEventNode;
	postProcess: PostProcessEventNode;
	renderers: RenderersEventNode;
}

import {PolyEngine} from '../../../Poly';
export class EventRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(AnimationEventNode, CATEGORY_EVENT.ANIMATION);
		poly.registerNode(AnyEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(ButtonEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(CameraDeviceOrientationControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(CameraMapControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(CameraNavigationBeaconsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(DelayEventNode, CATEGORY_EVENT.MISC);
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
		// networks
		poly.registerNode(AnimationsEventNode, CATEGORY_EVENT.NETWORK);
		poly.registerNode(CopEventNode, CATEGORY_EVENT.NETWORK);
		poly.registerNode(EventsEventNode, CATEGORY_EVENT.NETWORK);
		poly.registerNode(MaterialsEventNode, CATEGORY_EVENT.NETWORK);
		poly.registerNode(PostProcessEventNode, CATEGORY_EVENT.NETWORK);
	}
}
