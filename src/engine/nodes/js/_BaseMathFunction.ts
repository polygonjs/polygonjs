import {TypedJsNode} from './_Base';
import {JsConnectionPointType} from '../utils/io/connections/Js';
import {NodeParamsConfig} from '../utils/params/ParamsConfig';
import {rangeWithEnd, arrayCompact} from '../../../core/ArrayUtils';
import {NodeContext} from '../../poly/NodeContext';
import {TypedNodeConnection} from '../utils/io/NodeConnection';

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
				const compactConnections: TypedNodeConnection<NodeContext.JS>[] = [];
				arrayCompact(connections, compactConnections);
				let count = Math.max(compactConnections.length + 1, 2);
				return rangeWithEnd(count).map((i) => type);
			} else {
				return [];
			}
		} else {
			return rangeWithEnd(2).map((i) => type);
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
