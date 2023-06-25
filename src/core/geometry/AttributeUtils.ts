import {BaseCoreObject} from '../geometry/_BaseObject';
import {CoreObject} from '../geometry/Object';
import {Vector4, Vector3, Vector2} from 'three';
import {CoreObjectType, ObjectContent} from '../geometry/ObjectContent';

// vector
export function setObjectVector4(object: ObjectContent<CoreObjectType>, attribName: string, value: Vector4) {
	CoreObject.addAttribute(object, attribName, value);
}
export function getObjectVector4(object: ObjectContent<CoreObjectType>, attribName: string, target: Vector4) {
	CoreObject.attribValue(object, attribName, 0, target);
}
export function setObjectVector3(object: ObjectContent<CoreObjectType>, attribName: string, value: Vector3) {
	CoreObject.addAttribute(object, attribName, value);
}
export function getObjectVector3(object: ObjectContent<CoreObjectType>, attribName: string, target: Vector3) {
	CoreObject.attribValue(object, attribName, 0, target);
}
export function setObjectVector2(object: ObjectContent<CoreObjectType>, attribName: string, value: Vector2) {
	CoreObject.addAttribute(object, attribName, value);
}
export function getObjectVector2(object: ObjectContent<CoreObjectType>, attribName: string, target: Vector2) {
	CoreObject.attribValue(object, attribName, 0, target);
}
// number
export function setObjectNumber(object: ObjectContent<CoreObjectType>, attribName: string, value: number) {
	CoreObject.addAttribute(object, attribName, value);
}
export function getObjectNumber(
	object: ObjectContent<CoreObjectType>,
	attribName: string,
	defaultValue: number
): number {
	const val = CoreObject.attribValue(object, attribName, 0) as number | undefined;
	if (val == null) {
		return defaultValue;
	}
	return val;
}
// boolean
export function setObjectBoolean(object: ObjectContent<CoreObjectType>, attribName: string, value: boolean) {
	CoreObject.addAttribute(object, attribName, value);
}
export function getObjectBoolean(
	object: ObjectContent<CoreObjectType>,
	attribName: string,
	defaultValue: boolean
): boolean {
	const val = CoreObject.attribValue(object, attribName, 0) as boolean | undefined;
	if (val == null) {
		return defaultValue;
	}
	return val;
}
// string
export function setObjectString(object: ObjectContent<CoreObjectType>, attribName: string, value: string) {
	BaseCoreObject.addAttribute(object, attribName, value);
}
export function getObjectString(object: ObjectContent<CoreObjectType>, attribName: string): string | undefined {
	return BaseCoreObject.attribValue(object, attribName, 0) as string | undefined;
}
