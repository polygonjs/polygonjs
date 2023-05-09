import {TypedJsNode} from './_Base';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {JsConnectionPoint, JsConnectionPointType, JS_CONNECTION_POINT_IN_NODE_DEF} from '../utils/io/connections/Js';
const CONNECTION_OPTIONS = JS_CONNECTION_POINT_IN_NODE_DEF;

// interface RayProcessData {
// 	ray?: Ray;
// 	box3?: Box3;
// }

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
	// protected abstract _processRayData(): ReturnValueTypeByActorConnectionPointType[T];
	// protected _expectedInputName(index: number) {
	// 	return this._expectedInputType()[index];
	// }
	// protected _expectedInputType() {
	// 	return [JsConnectionPointType.RAY, JsConnectionPointType.BOX3];
	// }

	// public override outputValue(context: ActorNodeTriggerContext) {
	// 	this._processData.ray = this._inputValue<ActorConnectionPointType.RAY>(ActorConnectionPointType.RAY, context);
	// 	this._processData.box3 = this._inputValue<ActorConnectionPointType.BOX3>(
	// 		ActorConnectionPointType.BOX3,
	// 		context
	// 	);
	// 	return this._processRayData();
	// }
}
