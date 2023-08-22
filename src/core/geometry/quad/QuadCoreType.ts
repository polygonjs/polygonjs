import {CoreObjectType, ObjectContent, isObject3D} from '../ObjectContent';
import {QUADObjectType, QUAD_OBJECT_TYPES_SET} from './QuadCommon';
import {QuadObject} from './QuadObject';
import {Object3D} from 'three';

export function isQuadObject(o: ObjectContent<CoreObjectType>): o is QuadObject {
	return QUAD_OBJECT_TYPES_SET.has(o.type as QUADObjectType);
}
export function isQuadOrThreejsObject(o: ObjectContent<CoreObjectType>): o is Object3D | QuadObject {
	return isQuadObject(o) || isObject3D(o);
}
