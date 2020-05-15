import Quaternion from './gl/quaternion.glsl';
import {MathFunctionArg3Factory} from './_Math_Arg3';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

const DefaultValues: Dictionary<Number3> = {
	start: [0, 0, 1],
	end: [1, 0, 0],
	up: [0, 1, 0],
};

export class VectorAlignGlNode extends MathFunctionArg3Factory('vector_align', {
	in: ['start', 'end', 'up'],
	method: 'vector_align_with_up',
	functions: [Quaternion],
}) {
	protected _expected_input_types() {
		const type = GlConnectionPointType.VEC3;
		return [type, type, type];
	}
	protected _expected_output_types() {
		return [GlConnectionPointType.VEC4];
	}
	param_default_value(name: string) {
		return DefaultValues[name];
	}
}
