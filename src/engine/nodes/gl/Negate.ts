import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

export class NegateGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'negate';
	}

	initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function((index: number) => ['in'][index]);
	}

	protected _gl_input_name(index: number) {
		return ['in'][index];
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const in_value = ThreeToGl.any(this.variable_for_input(this._gl_input_name(0)));

		const gl_type = this.io.inputs.named_input_connection_points[0].type();
		const out = this.glVarName(this.io.connection_points.output_name(0));
		const body_line = `${gl_type} ${out} = -1.0 * ${in_value}`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
