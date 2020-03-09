import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

export class NegateGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'negate';
	}

	initialize_node() {
		super.initialize_node();

		this.gl_connections_controller.set_input_name_function((index: number) => ['in'][index]);
	}

	protected _gl_input_name(index: number) {
		return ['in'][index];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const in_value = ThreeToGl.any(this.variable_for_input(this._gl_input_name(0)));

		const gl_type = this.io.inputs.named_input_connection_points[0].type;
		const out = this.gl_var_name(this.gl_connections_controller.output_name(0));
		const body_line = `${gl_type} ${out} = -1.0 * ${in_value}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
