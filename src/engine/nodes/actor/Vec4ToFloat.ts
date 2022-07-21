/**
 * converts a vector4 to a float
 *
 *
 */
import {ParamType} from '../../poly/ParamType';
import {VecToActorFactory} from './_ConversionVecTo';

export class Vec4ToFloatActorNode extends VecToActorFactory('vec4ToFloat', {
	components: ['x', 'y', 'z', 'w'],
	param_type: ParamType.VECTOR4,
}) {}
