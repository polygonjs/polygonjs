import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunctionArg2';
import Quaternion from './gl/quaternion.glsl';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
import {FunctionGLDefinition} from './utils/GLDefinition';

enum InputName {
	AXIS = 'axis',
	ANGLE = 'angle',
}
const InputNames: Array<InputName> = [InputName.AXIS, InputName.ANGLE];
interface IDefaultValues {
	[InputName.AXIS]: Number3;
	[InputName.ANGLE]: number;
}
const DEFAULT_AXIS: Number3 = [0, 0, 1];
const DEFAULT_ANGLE: number = 0;
const DefaultValues: IDefaultValues = {
	[InputName.AXIS]: DEFAULT_AXIS,
	[InputName.ANGLE]: DEFAULT_ANGLE,
};

export class QuatFromAxisAngleGlNode extends BaseNodeGlMathFunctionArg2GlNode {
	static type() {
		return 'quat_from_axis_angle';
	}

	gl_input_name(index: number) {
		return InputNames[index];
	}
	gl_input_default_value(name: string) {
		return DefaultValues[name as InputName];
	}
	gl_method_name(): string {
		return 'quat_from_axis_angle';
	}

	protected expected_input_types() {
		return [ConnectionPointType.VEC3, ConnectionPointType.FLOAT];
	}
	protected expected_output_types() {
		return [ConnectionPointType.VEC4];
	}
	gl_function_definitions() {
		return [new FunctionGLDefinition(this, ConnectionPointType.VEC4, Quaternion)];
	}
}
