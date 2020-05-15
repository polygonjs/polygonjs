import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';
import Quaternion from './gl/quaternion.glsl';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

enum InputName {
	DIR = 'dir',
	UP = 'up',
}
const InputNames: Array<InputName> = [InputName.DIR, InputName.UP];
interface IDefaultValues {
	[InputName.DIR]: Number3;
	[InputName.UP]: Number3;
}
const DEFAULT_DIR: Number3 = [0, 0, 1];
const DEFAULT_UP: Number3 = [0, 1, 0];
const DefaultValues: IDefaultValues = {
	[InputName.DIR]: DEFAULT_DIR,
	[InputName.UP]: DEFAULT_UP,
};

export class AlignGlNode extends BaseNodeGlMathFunctionArg2GlNode {
	static type() {
		return 'align';
	}

	initialize_node() {
		super.initialize_node();

		this.io.connection_points.set_input_name_function((index: number) => InputNames[index]);
		this.io.connection_points.set_expected_input_types_function(() => [
			GlConnectionPointType.VEC3,
			GlConnectionPointType.VEC3,
		]);
		this.io.connection_points.set_expected_output_types_function(() => [GlConnectionPointType.VEC4]);
	}

	// gl_input_name(index: number) {
	// 	return InputNames[index];
	// }
	param_default_value(name: string) {
		return DefaultValues[name as InputName];
	}
	gl_method_name(): string {
		return 'align';
	}

	// protected expected_input_types() {
	// 	return [ConnectionPointType.VEC3, ConnectionPointType.VEC3];
	// }
	// protected expected_output_types() {
	// 	return [ConnectionPointType.VEC4];
	// }
	gl_function_definitions() {
		return [new FunctionGLDefinition(this, Quaternion)];
	}
}
