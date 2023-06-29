import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class BaseRayBox3JsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseRayBox3JsParamsConfig();
export abstract class BaseRayBox3JsNode extends TypedJsNode<BaseRayBox3JsParamsConfig> {
	override paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.BOX3, JsConnectionPointType.BOX3, CONNECTION_OPTIONS),
		]);
	}
}
