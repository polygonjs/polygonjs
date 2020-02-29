import {BaseGlMathFunctionGlNode} from './_BaseMathFunction';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

export class MixGlNode extends BaseGlMathFunctionGlNode {
	static type() {
		return 'mix';
	}

	initialize_node() {
		super.initialize_node();

		this.gl_connections_controller.set_input_name_function((index: number) => ['value0', 'value1', 'blend'][index]);
		this.gl_connections_controller.set_output_name_function((index: number) => 'mix');
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
	}

	// gl_input_name(index: number) {
	// 	return ['value0', 'value1', 'blend'][index];
	// }
	gl_output_name() {
		return 'mix';
	}
	// gl_method_name(): string {
	// 	return 'mix';
	// }

	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || ConnectionPointType.FLOAT;
		return [type, type, ConnectionPointType.FLOAT];
	}

	protected _expected_output_types() {
		const type = this._expected_input_types()[0];
		return [type];
	}
}
