import Quaternion from './gl/quaternion.glsl';
import {MathFunctionArg2Factory} from './_Math_Arg2';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

const DefaultValues: Dictionary<Number3> = {
	start: [0, 0, 1],
	end: [1, 0, 0],
};

export class VectorAngleGlNode extends MathFunctionArg2Factory('vector_angle', {
	in: ['start', 'end'],
	method: 'vector_angle',
	functions: [Quaternion],
}) {
	_expected_input_types() {
		const type = GlConnectionPointType.VEC3;
		return [type, type];
	}
	_expected_output_types() {
		return [GlConnectionPointType.FLOAT];
	}
	param_default_value(name: string) {
		return DefaultValues[name];
	}
}
