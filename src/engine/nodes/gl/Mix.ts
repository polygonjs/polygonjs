import {BaseGlMathFunctionGlNode} from './_BaseMathFunction';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

const DefaultValues: Dictionary<number> = {
	blend: 0.5,
};
export class MixGlNode extends BaseGlMathFunctionGlNode {
	static type() {
		return 'mix';
	}
	protected gl_method_name() {
		return 'mix';
	}
	gl_input_default_value(name: string) {
		return DefaultValues[name];
	}

	initialize_node() {
		super.initialize_node();

		this.gl_connections_controller.set_input_name_function((index: number) => ['value0', 'value1', 'blend'][index]);
		this.gl_connections_controller.set_output_name_function(this._gl_output_name.bind(this));
		this.gl_connections_controller.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.gl_connections_controller.set_expected_output_types_function(this._expected_output_types.bind(this));
	}

	protected _gl_output_name() {
		return 'mix';
	}

	protected _expected_input_types() {
		const type = this.gl_connections_controller.first_input_connection_type() || GlConnectionPointType.FLOAT;
		return [type, type, GlConnectionPointType.FLOAT];
	}

	protected _expected_output_types() {
		const type = this._expected_input_types()[0];
		return [type];
	}
}
