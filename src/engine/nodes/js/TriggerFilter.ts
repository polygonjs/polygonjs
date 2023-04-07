/**
 * only forwards the trigger received if the condition is true
 *
 *
 */

import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
// import {ParamType} from '../../poly/ParamType';

const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class TriggerFilterJsParamsConfig extends NodeParamsConfig {
	/** @param If true, the trigger will be forwarded. If false, it will not be. */
	condition = ParamConfig.BOOLEAN(1);
}
const ParamsConfig = new TriggerFilterJsParamsConfig();

export class TriggerFilterJsNode extends TypedJsNode<TriggerFilterJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
	static override type() {
		return 'triggerFilter';
	}

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);
		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}

	// public override receiveTrigger(context: JsNodeTriggerContext) {
	// 	const condition = this._inputValueFromParam<ParamType.BOOLEAN>(this.p.condition, context);
	// 	if (condition == true) {
	// 		this.runTrigger(context);
	// 	}
	// }
}
