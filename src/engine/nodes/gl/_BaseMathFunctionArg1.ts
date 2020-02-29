import {BaseGlMathFunctionGlNode} from './_BaseMathFunction';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

export abstract class BaseNodeGlMathFunctionArg1GlNode extends BaseGlMathFunctionGlNode {
	initialize_node() {
		super.initialize_node();
		this.gl_connections_controller.set_input_name_function(this._gl_input_name.bind(this));
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
	}
	protected _gl_input_name(index: number) {
		return 'in';
	}
	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type];
	}

	// protected expected_named_input_constructors() {
	// 	const constructor = this.input_connection_constructor() || Connection.Float;
	// 	return [constructor];
	// }

	// protected expected_named_output_constructors() {
	// 	const constructor = this.output_connection_constructor();
	// 	return [constructor];
	// }
}
