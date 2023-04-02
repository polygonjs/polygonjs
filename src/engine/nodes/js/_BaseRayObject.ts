import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

// interface RayProcessData {
// 	ray?: Ray;
// 	Object3D?: Object3D;
// }

class BaseRayObjectJsParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseRayObjectJsParamsConfig();
export abstract class BaseRayObjectJsNode extends TypedJsNode<BaseRayObjectJsParamsConfig> {
	override paramsConfig = ParamsConfig;

	override initializeNode() {
		this.io.inputs.setNamedInputConnectionPoints([
			new JsConnectionPoint(JsConnectionPointType.RAY, JsConnectionPointType.RAY, CONNECTION_OPTIONS),
			new JsConnectionPoint(JsConnectionPointType.OBJECT_3D, JsConnectionPointType.OBJECT_3D, CONNECTION_OPTIONS),
		]);
	}
	// override initializeNode() {
	// 	super.initializeNode();

	// 	this.io.connection_points.initializeNode();
	// 	this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	// 	this.io.connection_points.set_output_name_function(this._expectedOutputName.bind(this));
	// 	this.io.connection_points.set_expected_input_types_function(this._expectedInputType.bind(this));
	// 	this.io.connection_points.set_expected_output_types_function(() => [this._expectedOutputType()]);
	// }
	// protected abstract _expectedOutputName(index: number): string;
	// protected abstract _expectedOutputType(): T;
	// protected _processData: RayProcessData = {};
	// protected abstract _processRayData(context: ActorNodeTriggerContext): ReturnValueTypeByActorConnectionPointType[T];
	// protected _expectedInputName(index: number) {
	// 	return this._expectedInputType()[index];
	// }
	// protected _expectedInputType() {
	// 	return [ActorConnectionPointType.RAY, ActorConnectionPointType.OBJECT_3D];
	// }

	// public override outputValue(context: ActorNodeTriggerContext) {
	// 	this._processData.ray = this._inputValue<ActorConnectionPointType.RAY>(ActorConnectionPointType.RAY, context);
	// 	this._processData.Object3D =
	// 		this._inputValue<ActorConnectionPointType.OBJECT_3D>(ActorConnectionPointType.OBJECT_3D, context) ||
	// 		context.Object3D;
	// 	return this._processRayData(context);
	// }
}
