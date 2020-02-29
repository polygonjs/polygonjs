import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunctionArg2';
import Quaternion from './gl/quaternion.glsl';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';
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

		this.gl_connections_controller.set_input_name_function((index: number) => InputNames[index]);
		this.gl_connections_controller.set_expected_input_types_function(() => [
			ConnectionPointType.VEC3,
			ConnectionPointType.VEC3,
		]);
		this.gl_connections_controller.set_expected_output_types_function(() => [ConnectionPointType.VEC4]);
	}

	// gl_input_name(index: number) {
	// 	return InputNames[index];
	// }
	gl_input_default_value(name: string) {
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
		return [new FunctionGLDefinition(this, ConnectionPointType.VEC4, Quaternion)];
	}
}
