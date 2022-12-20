import {CATEGORY_EVENT} from './Category';

import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
import {CodeEventNode} from '../../../nodes/event/Code';
import {FirstPersonControlsEventNode} from '../../../nodes/event/FirstPersonControls';
import {MessageEventNode} from '../../../nodes/event/Message';
import {MobileJoystickControlsEventNode} from '../../../nodes/event/MobileJoystickControls';
import {SceneEventNode} from '../../../nodes/event/Scene';

export interface EventNodeChildrenMap {
	cameraMapControls: CameraOrbitControlsEventNode;
	code: CodeEventNode;
	firstPersonControls: FirstPersonControlsEventNode;
	message: MessageEventNode;
	mobileJoystickControls: MobileJoystickControlsEventNode;
	scene: SceneEventNode;
}

import {PolyEngine} from '../../../Poly';
export class EventRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(CodeEventNode, CATEGORY_EVENT.ADVANCED);
		poly.registerNode(FirstPersonControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(MessageEventNode, CATEGORY_EVENT.MISC);
		poly.registerNode(MobileJoystickControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(SceneEventNode, CATEGORY_EVENT.INPUT);
	}
}
