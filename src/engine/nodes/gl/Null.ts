import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
// import {ParamType} from '../../../Engine/Param/_Module';
// import {TypedConnectionFloat} from './GlData'
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

export class NullGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'null';
	}

	setLines(shaders_collection_controller: ShadersCollectionController) {
		const in_value = ThreeToGl.any(this.variable_for_input(this._gl_input_name(0)));

		const out_connection_point = this.io.outputs.named_output_connection_points[0];
		const gl_type = out_connection_point.type();
		const out = this.glVarName(out_connection_point.name());
		const body_line = `${gl_type} ${out} = ${in_value}`;
		shaders_collection_controller.addBodyLines(this, [body_line]);
	}
}
