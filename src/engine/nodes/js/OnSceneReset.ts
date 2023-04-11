/**
 * sends a trigger when the scene is back at the start frame
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

class OnSceneResetJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnSceneResetJsParamsConfig();

export class OnSceneResetJsNode extends TypedJsNode<OnSceneResetJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_SCENE_RESET;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggeringLines(
		shadersCollectionController: ShadersCollectionController,
		triggeredMethods: string
	): void {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: true,
		});
	}
}
