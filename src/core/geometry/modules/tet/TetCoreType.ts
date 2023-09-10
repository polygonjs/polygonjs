import {CoreObjectType, ObjectContent} from '../../ObjectContent';

export function isTetObject(o: ObjectContent<CoreObjectType>) {
	return o.type == CoreObjectType.TET;
}
