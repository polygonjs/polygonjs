import {CATEGORY_EVENT} from './Category';

import {CameraOrbitControlsEventNode} from '../../../nodes/event/CameraOrbitControls';
import {FirstPersonControlsEventNode} from '../../../nodes/event/FirstPersonControls';
import {PlayerControlsEventNode} from '../../../nodes/event/PlayerControls';
import {SceneEventNode} from '../../../nodes/event/Scene';

export interface EventNodeChildrenMap {
	cameraMapControls: CameraOrbitControlsEventNode;
	firstPersonControls: FirstPersonControlsEventNode;
	PlayerControls: PlayerControlsEventNode;
	scene: SceneEventNode;
}

import {PolyEngine} from '../../../Poly';
export class EventRegister {
	static run(poly: PolyEngine) {
		poly.registerNode(CameraOrbitControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(FirstPersonControlsEventNode, CATEGORY_EVENT.CAMERA);
		poly.registerNode(PlayerControlsEventNode, CATEGORY_EVENT.INPUT);
		poly.registerNode(SceneEventNode, CATEGORY_EVENT.INPUT);
	}
}
