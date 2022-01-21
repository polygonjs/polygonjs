/**
 * finds the angle between vectors
 *
 *
 *
 *
 */

import {Number3, PolyDictionary} from '../../../types/GlobalTypes';
import Quaternion from './gl/quaternion.glsl';
import {MathFunctionArg2Factory} from './_Math_Arg2';
import {GlConnectionPointType} from '../utils/io/connections/Gl';

const DefaultValues: PolyDictionary<Number3> = {
	start: [0, 0, 1],
	end: [1, 0, 0],
};

export class VectorAngleGlNode extends MathFunctionArg2Factory('vectorAngle', {
	in: ['start', 'end'],
	method: 'vectorAngle',
	functions: [Quaternion],
}) {
	_expected_input_types() {
		const type = GlConnectionPointType.VEC3;
		return [type, type];
	}
	_expected_output_types() {
		return [GlConnectionPointType.FLOAT];
	}
	paramDefaultValue(name: string) {
		return DefaultValues[name];
	}
}
