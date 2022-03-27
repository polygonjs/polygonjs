import {ParamType} from '../../poly/ParamType';
import {VecToActorFactory} from './_ConversionVecTo';

export class Vec3ToFloatActorNode extends VecToActorFactory('vec3ToFloat', {
	components: ['x', 'y', 'z'],
	param_type: ParamType.VECTOR3,
}) {}
