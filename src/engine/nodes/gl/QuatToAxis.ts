/**
 * converts a quaternion to an axis
 *
 *
 *
 */

import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunction';
import Quaternion from './gl/quaternion.glsl';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

export class QuatToAxisGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static override type() {
		return 'quatToAxis';
	}

	override initializeNode() {
		super.initializeNode();

		this.io.connection_points.set_input_name_function((index: number) => ['quat'][index]);
		this.io.connection_points.set_expected_input_types_function(() => [GlConnectionPointType.VEC4]);
		this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.VEC3]);
	}

	// protected _gl_input_name(index: number) {
	// 	return ['quat'][index];
	// }
	override gl_method_name(): string {
		return 'quatToAxis';
	}

	// protected _expected_input_types() {
	// 	return [ConnectionPointType.VEC4];
	// }
	// protected _expected_output_types() {
	// 	return [ConnectionPointType.VEC3];
	// }
	override gl_function_definitions() {
		return [new FunctionGLDefinition(this, Quaternion)];
	}
}
