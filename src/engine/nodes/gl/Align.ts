/**
 * rotates a vector
 *
 *
 */

import {Number3} from '../../../types/GlobalTypes';
import {BaseNodeGlMathFunctionArg2GlNode} from './_BaseMathFunction';
import Quaternion from './gl/quaternion.glsl';
import {GlConnectionPointType} from '../utils/io/connections/Gl';
import {FunctionGLDefinition} from './utils/GLDefinition';

enum AlignGlNodeInputName {
	DIR = 'dir',
	UP = 'up',
}
const InputNames: Array<AlignGlNodeInputName> = [AlignGlNodeInputName.DIR, AlignGlNodeInputName.UP];
interface IDefaultValues {
	[AlignGlNodeInputName.DIR]: Number3;
	[AlignGlNodeInputName.UP]: Number3;
}
const DEFAULT_DIR: Number3 = [0, 0, 1];
const DEFAULT_UP: Number3 = [0, 1, 0];
const DefaultValues: IDefaultValues = {
	[AlignGlNodeInputName.DIR]: DEFAULT_DIR,
	[AlignGlNodeInputName.UP]: DEFAULT_UP,
};

export class AlignGlNode extends BaseNodeGlMathFunctionArg2GlNode {
	static override type() {
		return 'align';
	}

	override initializeNode() {
		super.initializeNode();

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
	override paramDefaultValue(name: string) {
		return DefaultValues[name as AlignGlNodeInputName];
	}
	override gl_method_name(): string {
		return 'align';
	}

	// protected expected_input_types() {
	// 	return [ConnectionPointType.VEC3, ConnectionPointType.VEC3];
	// }
	// protected expected_output_types() {
	// 	return [ConnectionPointType.VEC4];
	// }
	override gl_function_definitions() {
		return [new FunctionGLDefinition(this, Quaternion)];
	}
}
