import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunctionArg1';
// import {ParamType} from '../../../Engine/Param/_Module';
// import {TypedConnectionFloat} from './GlData'
import {ThreeToGl} from '../../../core/ThreeToGl';
import {ShadersCollectionController} from './code/utils/ShadersCollectionController';

export class NullGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'null';
	}

	set_lines(shaders_collection_controller: ShadersCollectionController) {
		const in_value = ThreeToGl.any(this.variable_for_input('in'));

		const gl_type = this.io.inputs.named_input_connection_points[0].type;
		const out = this.gl_var_name('value');
		const body_line = `${gl_type} ${out} = ${in_value}`;
		shaders_collection_controller.add_body_lines(this, [body_line]);
	}
}
