/**
 * sends a trigger when the scene pauses
 *
 *
 */

import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType} from '../utils/io/connections/Js';
import {JsType} from '../../poly/registers/nodes/types/Js';
import {JsLinesCollectionController} from './code/utils/JsLinesCollectionController';

class OnScenePauseJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new OnScenePauseJsParamsConfig();

export class OnScenePauseJsNode extends TypedJsNode<OnScenePauseJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return JsType.ON_SCENE_PAUSE;
	}
	override isTriggering() {
		return true;
	}

	override initializeNode() {
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.TRIGGER, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggeringLines(
		shadersCollectionController: JsLinesCollectionController,
		triggeredMethods: string
	): void {
		shadersCollectionController.addTriggeringLines(this, [triggeredMethods], {
			gatherable: true,
		});
	}
}
