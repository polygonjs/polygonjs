/**
 * convenient node to apply an addition, followed by a mult and another addition
 *
 *
 *
 */

import {BaseNodeGlMathFunctionArg4GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {PolyDictionary} from '../../../types/GlobalTypes';

const DefaultValues: PolyDictionary<number> = {
	mult: 1,
};

enum MultAddGlNodeInputName {
	VALUE = 'value',
	PRE_ADD = 'preAdd',
	MULT = 'mult',
	POST_ADD = 'postAdd',
}

export class MultAddGlNode extends BaseNodeGlMathFunctionArg4GlNode {
	static override type() {
		return 'multAdd';
	}

	protected override _gl_input_name(index: number) {
		return [
			MultAddGlNodeInputName.VALUE,
			MultAddGlNodeInputName.PRE_ADD,
			MultAddGlNodeInputName.MULT,
			MultAddGlNodeInputName.POST_ADD,
		][index];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const ouputConnectionPoints = this.io.outputs.namedOutputConnectionPoints();
		if (!ouputConnectionPoints) {
			return;
		}
		const value = ThreeToGl.any(this.variableForInput(MultAddGlNodeInputName.VALUE));
		const preAdd = ThreeToGl.any(this.variableForInput(MultAddGlNodeInputName.PRE_ADD));
		const mult = ThreeToGl.any(this.variableForInput(MultAddGlNodeInputName.MULT));
		const postAdd = ThreeToGl.any(this.variableForInput(MultAddGlNodeInputName.POST_ADD));

		const gl_type = this._expected_output_types()[0];
		const out_name = ouputConnectionPoints[0].name();
		const out = this.glVarName(out_name);
		const body_line = `${gl_type} ${out} = (${mult}*(${value} + ${preAdd})) + ${postAdd}`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
