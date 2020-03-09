import {BaseNodeGlMathFunctionArg4GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

const DefaultValues: Dictionary<number> = {
	mult: 1,
};

export class MultAdd extends BaseNodeGlMathFunctionArg4GlNode {
	static type() {
		return 'mult_add';
	}

	protected _gl_input_name(index: number) {
		return ['value', 'pre_add', 'mult', 'post_add'][index];
	}
	gl_input_default_value(name: string) {
		return DefaultValues[name];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const value = ThreeToGl.any(this.variable_for_input('value'));
		const pre_add = ThreeToGl.any(this.variable_for_input('pre_add'));
		const mult = ThreeToGl.any(this.variable_for_input('mult'));
		const post_add = ThreeToGl.any(this.variable_for_input('post_add'));

		const gl_type = this._expected_output_types()[0];
		const out = this.gl_var_name('value');
		const body_line = `${gl_type} ${out} = (${mult}*(${value} + ${pre_add})) + ${post_add}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
