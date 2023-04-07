/**
 * forwards the trigger after a delay
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {Poly} from '../../Poly';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class TriggerDelayJsParamsConfig extends NodeParamsConfig {
	/** @param delay (in milliseconds) */
	delay = ParamConfig.FLOAT(1000, {
		range: [0, 10000],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new TriggerDelayJsParamsConfig();

export class TriggerDelayJsNode extends TypedJsNode<TriggerDelayJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'triggerDelay';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
	override setTriggerableLines(shadersCollectionController: ShadersCollectionController) {
		const delay = this.variableForInputParam(shadersCollectionController, this.p.delay);

		const func = Poly.namedFunctionsRegister.getFunction('sleep', this, shadersCollectionController);
		const bodyLine = func.asString(delay);
		shadersCollectionController.addTriggerableLines(this, [bodyLine], {async: true});
	}
}
