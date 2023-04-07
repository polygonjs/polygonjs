/**
 * sends a trigger when the mapbox camera starts moving
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';

class OnMapboxCameraMoveStartJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnMapboxCameraMoveStartJsParamsConfig();

export class OnMapboxCameraMoveStartJsNode extends TypedJsNode<OnMapboxCameraMoveStartJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_MAPBOX_CAMERA_MOVE_START;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
}
