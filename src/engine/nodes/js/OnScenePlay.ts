/**
 * sends a trigger when the scene plays
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';

class OnScenePlayJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnScenePlayJsParamsConfig();

export class OnScenePlayJsNode extends TypedJsNode<OnScenePlayJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_SCENE_PLAY;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER),
		]);
	}
}
