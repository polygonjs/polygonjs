import {BaseNodeGlMathFunctionArg1GlNode} from './_BaseMathFunctionArg1';
import Quaternion from './gl/quaternion.glsl';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {FunctionGLDefinition} from './utils/GLDefinition';

export class QuatToAxisGlNode extends BaseNodeGlMathFunctionArg1GlNode {
	static type() {
		return 'quat_to_axis';
	}

	gl_input_name(index: number) {
		return ['quat'][index];
	}
	gl_method_name(): string {
		return 'quat_to_axis';
	}

	protected expected_input_types() {
		return [ConnectionPointType.VEC4];
	}
	protected expected_output_types() {
		return [ConnectionPointType.VEC3];
	}
	gl_function_definitions() {
		return [new FunctionGLDefinition(this, ConnectionPointType.VEC3, Quaternion)];
	}
}
