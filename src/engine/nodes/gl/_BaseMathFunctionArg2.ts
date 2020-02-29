import {BaseGlMathFunctionGlNode} from './_BaseMathFunction';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
export abstract class BaseNodeGlMathFunctionArg2GlNode extends BaseGlMathFunctionGlNode {
	initialize_node() {
		super.initialize_node();
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
	}

	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type];
	}

	protected _expected_output_types() {
		const type = this._expected_input_types()[0];
		return [type];
	}
}
