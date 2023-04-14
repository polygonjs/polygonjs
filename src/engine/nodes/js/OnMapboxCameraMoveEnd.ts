/**
 * sends a trigger when the mapbox camera stops moving
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';

class OnMapboxCameraMoveEndJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnMapboxCameraMoveEndJsParamsConfig();

export class OnMapboxCameraMoveEndJsNode extends TypedJsNode<OnMapboxCameraMoveEndJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_MAPBOX_CAMERA_MOVE_END;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggeringLines(shadersCollectionController: JsLinesCollectionController, triggeredMethods: string) {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: true,
		});
	}
}
