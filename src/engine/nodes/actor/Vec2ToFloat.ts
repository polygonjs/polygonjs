import {ParamType} from '../../poly/ParamType';
import {VecToActorFactory} from './_ConversionVecTo';

export class Vec2ToFloatActorNode extends VecToActorFactory('vec2ToFloat', {
	components: ['x', 'y'],
	param_type: ParamType.VECTOR2,
}) {}
