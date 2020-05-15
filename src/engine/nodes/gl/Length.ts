import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

export class LengthGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'length';
	}

	initialize_node() {
		super.initialize_node();

		this.io.connection_points.set_input_name_function(this._gl_input_name.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
	}

	protected _gl_input_name(index: number) {
		return ['x'][index];
	}
	gl_method_name(): string {
		return 'length';
	}

	protected _expected_output_types() {
		return [GlConnectionPointType.FLOAT];
	}
}
