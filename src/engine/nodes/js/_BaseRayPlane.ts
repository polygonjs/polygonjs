import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class BaseRayPlaneJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseRayPlaneJsParamsConfig();
export abstract class BaseRayPlaneJsNode extends TypedJsNode<BaseRayPlaneJsParamsConfig> {
	override paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.PLANE, JsConnectionPointType.PLANE, CONNECTION_OPTIONS),
		]);
	}
}
