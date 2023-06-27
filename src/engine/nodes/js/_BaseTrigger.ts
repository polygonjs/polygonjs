import {TRIGGER_CONNECTION_NAME, TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

export abstract class BaseTriggerJsNode<K extends NodeParamsConfig> extends TypedJsNode<K> {
	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER, CONNECTION_OPTIONS),
		]);

		this.io.outputs.setNamedOutputConnectionPoints([
			new JsConnectionPoint(TRIGGER_CONNECTION_NAME, JsConnectionPointType.TRIGGER),
		]);
	}
}
class BaseTriggerJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseTriggerJsParamsConfig();
export abstract class ParamlessBaseTriggerJsNode extends BaseTriggerJsNode<BaseTriggerJsParamsConfig> {
	override readonly paramsConfig = ParamsConfig;
}
