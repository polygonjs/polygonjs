/**
 * blends between 2 quaternions
 *
 * https://en.wikipedia.org/wiki/Slerp
 *
 *
 */

import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import Quaternion from './gl/quaternion.glsl';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

export class QuatSlerpGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static override type() {
		return 'quatSlerp';
	}
	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function((index: number) => ['quat0', 'quat1', 'blend'][index]);
		this.io.connection_points.set_expected_input_types_function(() => [
			GlConnectionPointType.VEC4,
			GlConnectionPointType.VEC4,
			GlConnectionPointType.FLOAT,
		]);
		this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.VEC4]);
	}

	// protected _gl_input_name(index: number) {
	// 	return ['quat0', 'quat1'][index];
	// }
	override gl_method_name(): string {
		return 'quatSlerp';
	}

	// protected _expected_input_types() {
	// 	return [ConnectionPointType.VEC4, ConnectionPointType.VEC4];
	// }
	// protected _expected_output_types() {
	// 	return [ConnectionPointType.VEC4];
	// }
	override gl_function_definitions() {
		return [new FunctionGLDefinition(this, Quaternion)];
	}
}
