/**
 * outputs the length of a vector, clamping it to a max value
 *
 *
 *
 */

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
	static override type() {
		return 'maxLength';
	}
	protected override _expected_input_types() {
		const type = this.io.connection_points.first_input_connection_type() || GlConnectionPointType.VEC3;
		return [type, GlConnectionPointType.FLOAT];
	}

	protected override _gl_input_name(index: number): string {
		return ['val', 'max'][index];
	}
	override paramDefaultValue(name: string) {
		return MaxLengthDefaultValues[name];
	}
	protected override gl_method_name(): string {
		return 'maxLength';
	}

	override gl_function_definitions() {
		return [new FunctionGLDefinition(this, MaxLength)];
	}
}
