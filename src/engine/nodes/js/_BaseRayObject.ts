import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

class BaseRayObjectJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseRayObjectJsParamsConfig();
export abstract class BaseRayObjectJsNode extends TypedJsNode<BaseRayObjectJsParamsConfig> {
	override paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
			...this._additionalInputs(),
		]);
	}
	protected _additionalInputs(): JsConnectionPoint<JsConnectionPointType>[] {
		return [];
	}
}
