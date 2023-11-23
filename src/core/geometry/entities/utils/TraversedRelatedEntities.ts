import {AttribClass} from '../../Constant';

export interface TraversedRelatedEntityData {
	[AttribClass.CORE_GROUP]: {ids: number[]};
	[AttribClass.OBJECT]: {ids: number[]};
	[AttribClass.PRIMITIVE]: {ids: number[]};
	[AttribClass.VERTEX]: {ids: number[]};
	[AttribClass.POINT]: {ids: number[]};
}
