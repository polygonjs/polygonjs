import Quaternion from './gl/quaternion.glsl';
import {MathFunctionArg2Factory} from './_Math_Arg2';
import {ConnectionPointType} from '../utils/connections/ConnectionPointType';

const DefaultValues: Dictionary<Number3> = {
	start: [0, 0, 1],
	end: [1, 0, 0],
};

export class VectorAngleGlNode extends MathFunctionArg2Factory('vector_angle', {
	in: ['start', 'end'],
	method: 'vector_angle',
	functions: [Quaternion],
}) {
	protected _expected_input_types() {
		const type = ConnectionPointType.VEC3;
		return [type, type];
	}
	protected _expected_output_types() {
		return [ConnectionPointType.FLOAT];
	}
	gl_input_default_value(name: string) {
		return DefaultValues[name];
	}
}
