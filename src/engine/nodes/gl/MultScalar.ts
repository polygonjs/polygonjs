/**
 * convenient node to multiply a vector by a scalar
 *
 *
 *
 */
import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';
import {PolyDictionary} from '../../../types/GlobalTypes';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

const DefaultValues: PolyDictionary<number> = {
	value: 1,
	mult: 1,
};

enum InputName {
	VALUE = 'value',
	MULT = 'mult',
}

export class MultScalarGlNode extends BaseNodeGlMathFunctionArg2GlNode {
	static override type() {
		return 'multScalar';
	}

	protected override _expected_input_types() {
		const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
		return [type, GlConnectionPointType.FLOAT];
	}
	protected override _gl_input_name(index: number) {
		return [InputName.VALUE, InputName.MULT][index];
	}
	override paramDefaultValue(name: string) {
		return DefaultValues[name];
	}

	override setLines(shaders_collection_controller: ShadersCollectionController) {
		const value = ThreeToGl.any(this.variableForInput(InputName.VALUE));
		const mult = ThreeToGl.any(this.variableForInput(InputName.MULT));

		const gl_type = this._expected_output_types()[0];
		const out_name = this.io.outputs.namedOutputConnectionPoints()[0].name();
		const out = this.glVarName(out_name);
		const body_line = `${gl_type} ${out} = (${mult}*${value})`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
