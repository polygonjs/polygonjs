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

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const value = ThreeToGl.any(this.variableForInput(InputName.VALUE));
		const preAdd = ThreeToGl.any(this.variableForInput(InputName.PRE_ADD));
		const mult = ThreeToGl.any(this.variableForInput(InputName.MULT));
		const postAdd = ThreeToGl.any(this.variableForInput(InputName.POST_ADD));

		const gl_type = this._expected_output_types()[0];
		const out_name = this.io.outputs.namedOutputConnectionPoints()[0].name();
		const out = this.glVarName(out_name);
		const body_line = `${gl_type} ${out} = (${mult}*(${value} + ${preAdd})) + ${postAdd}`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
