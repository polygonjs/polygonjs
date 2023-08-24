import {CoreObjectType, ObjectContent, isObject3D} from '../geometry/ObjectContent';
import {CoreWFCTileAttribute, CoreWFCConnectionAttribute} from './WFCAttributes';

export function filterTileObjects(objects: ObjectContent<CoreObjectType>[]) {
	return objects.filter((object) => CoreWFCTileAttribute.getIsTile(object)).filter(isObject3D);
}
export function filterConnectionObjects(objects: ObjectContent<CoreObjectType>[]) {
	return objects.filter((object) => CoreWFCConnectionAttribute.getIsConnection(object));
}
