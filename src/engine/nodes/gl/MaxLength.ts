import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';
import MaxLength from './gl/max_length.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

//
//
// MAX LENGTH
//
//
const MaxLengthDefaultValues: Dictionary<number> = {
	max: 1,
};

export class MaxLengthGlNode extends BaseNodeGlMathFunctionArg2GlNode {
	static type() {
		return 'max_length';
	}
	protected _expected_input_types() {
		const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
		return [type, GlConnectionPointType.FLOAT];
	}

	protected _gl_input_name(index: number): string {
		return ['val', 'max'][index];
	}
	param_default_value(name: string) {
		return MaxLengthDefaultValues[name];
	}
	protected gl_method_name(): string {
		return 'max_length';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, MaxLength)];
	}
}
