import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';

import {ThreeToGl} from '../../../core/ThreeToGl';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

export abstract class BaseNodeGlMathFunctionArgBoolean2GlNode extends BaseNodeGlMathFunctionArg2GlNode {
	initialize_node() {
		super.initialize_node();
		this.io.connection_points.set_expected_input_types_function(this._expected_input_types.bind(this));
		this.io.connection_points.set_expected_output_types_function(this._expected_output_types.bind(this));
	}
	protected _expected_input_types() {
		return [GlConnectionPointType.BOOL, GlConnectionPointType.BOOL];
	}

	protected _expected_output_types() {
		return [GlConnectionPointType.BOOL];
	}

	abstract boolean_operation(): string;

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const args = this.io.inputs.named_input_connection_points.map((named_input, i) => {
			const name = named_input.name;
			return ThreeToGl.any(this.variable_for_input(name));
		});
		const joined_args = args.join(` ${this.boolean_operation()} `);

		const sum = this.gl_var_name(this.io.connection_points.output_name(0));
		const body_line = `bool ${sum} = ${joined_args}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
