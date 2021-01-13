import {BaseNodeGlMathFunctionArg4GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {PolyDictionary} from '../../../types/GlobalTypes';

const DefaultValues: PolyDictionary<number> = {
	mult: 1,
};

enum InputName {
	VALUE = 'value',
	PRE_ADD = 'preAdd',
	MULT = 'mult',
	POST_ADD = 'postAdd',
}

export class MultAddGlNode extends BaseNodeGlMathFunctionArg4GlNode {
	static type() {
		return 'multAdd';
	}

	protected _gl_input_name(index: number) {
		return [InputName.VALUE, InputName.PRE_ADD, InputName.MULT, InputName.POST_ADD][index];
	}
	param_default_value(name: string) {
		return DefaultValues[name];
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const value = ThreeToGl.any(this.variable_for_input(InputName.VALUE));
		const preAdd = ThreeToGl.any(this.variable_for_input(InputName.PRE_ADD));
		const mult = ThreeToGl.any(this.variable_for_input(InputName.MULT));
		const postAdd = ThreeToGl.any(this.variable_for_input(InputName.POST_ADD));

		const gl_type = this._expected_output_types()[0];
		const out_name = this.io.outputs.named_output_connection_points[0].name();
		const out = this.gl_var_name(out_name);
		const body_line = `${gl_type} ${out} = (${mult}*(${value} + ${preAdd})) + ${postAdd}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
