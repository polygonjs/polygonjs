import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';
import MaxLength from './gl/max_length.glsl';
import {FunctionGLDefinition} from './utils/GLDefinition';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {PolyDictionary} from '../../../types/GlobalTypes';

//
//
// MAX LENGTH
//
//
const MaxLengthDefaultValues: PolyDictionary<number> = {
	max: 1,
};

export class MaxLengthGlNode extends BaseNodeGlMathFunctionArg2GlNode {
	static type() {
		return 'maxLength';
	}
	protected _expected_input_types() {
		const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
		return [type, GlConnectionPointType.FLOAT];
	}

	protected _gl_input_name(index: number): string {
		return ['val', 'max'][index];
	}
	paramDefaultValue(name: string) {
		return MaxLengthDefaultValues[name];
	}
	protected gl_method_name(): string {
		return 'maxLength';
	}

	gl_function_definitions() {
		return [new FunctionGLDefinition(this, MaxLength)];
	}
}
