import {TypedJsNode} from './_Base';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {ArrayUtils} from '../../../core/ArrayUtils';

export class BaseJsMathFunctionParamsConfig extends NodeParamsConfig {}
const ParamsConfig = new BaseJsMathFunctionParamsConfig();
export abstract class BaseMathFunctionJsNode extends TypedJsNode<BaseJsMathFunctionParamsConfig> {
	override paramsConfig = ParamsConfig;

	override initializeNode() {
		super.initializeNode();
		this.io.connection_points.set_expected_input_types_function(this._expectedInputTypes.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expectedOutputTypes.bind(this));
		this.io.connection_points.set_input_name_function(this._expectedInputName.bind(this));
	}
	protected _expectedInputTypes(): JsConnectionPointType[] {
		const type: JsConnectionPointType =
			this.io.connection_points.first_input_connection_type() || JsConnectionPointType.FLOAT;
		if (this.io.connections.firstInputConnection()) {
			const connections = this.io.connections.inputConnections();
			if (connections) {
				let count = Math.max(ArrayUtils.compact(connections).length + 1, 2);
				return ArrayUtils.range(count).map((i) => type);
			} else {
				return [];
			}
		} else {
			return ArrayUtils.range(2).map((i) => type);
		}
	}
	protected _expectedOutputTypes() {
		const type = this._expectedInputTypes()[0];
		return [type];
	}
	protected _expectedInputName(index: number) {
		return 'in';
	}
	protected _expectedOutputName(index: number) {
		return 'val';
	}
}
