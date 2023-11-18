import {AttribClass} from '../../Constant';
import type {BaseCoreObject} from '../object/BaseCoreObject';
import type {CoreGroup} from '../../Group';
import type {CoreObjectType} from '../../ObjectContent';
import type {CorePrimitive} from '../primitive/CorePrimitive';
import type {CoreVertex} from '../vertex/CoreVertex';
import type {CorePoint} from '../point/CorePoint';

export interface TraversedRelatedEntities {
	[AttribClass.CORE_GROUP]: CoreGroup[];
	[AttribClass.OBJECT]: BaseCoreObject<CoreObjectType>[];
	[AttribClass.PRIMITIVE]: CorePrimitive<CoreObjectType>[];
	[AttribClass.VERTEX]: CoreVertex<CoreObjectType>[];
	[AttribClass.POINT]: CorePoint<CoreObjectType>[];
}
