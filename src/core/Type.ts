import {Euler, Vector2, Vector3, Vector4, Quaternion, Color} from 'three';

export function isArray(value: any): value is any[] {
	return Array.isArray(value);
}
export function isBoolean(value: any): value is boolean {
	return value === true || value === false;
}
export function isNumber(value: any): value is number {
	return typeof value == 'number';
}
export function isNumberValid(value: any): value is number {
	return isNumber(value) && !isNaN(value);
}
export const coreTypeIsNaN = isNaN;
// export function _isNaN(value: any): boolean {
// 	return isNaN(value);
// }
export function isVector(value: any): value is Vector2 | Vector3 | Vector4 {
	return value instanceof Vector2 || value instanceof Vector3 || value instanceof Vector4;
}
export function isColor(value: any): value is Color {
	return value instanceof Color;
}
export function isEuler(value: any): value is Euler {
	return value instanceof Euler;
}
export function isQuaternion(value: any): value is Quaternion {
	return value instanceof Quaternion;
}
export function isString(value: any): value is string {
	return typeof value == 'string';
}
export function isObject(value: any): value is object {
	var type = typeof value;
	return value != null && (type == 'object' || type == 'function');
}
export function isFunction(value: any): value is Function {
	var type = typeof value;
	return value != null && type == 'function';
}
export function isPromise<T extends any>(value: any): value is Promise<T> {
	return value instanceof Promise;
}
// a simple way to test the type and value of a param value
export function isBooleanTrue(value: boolean) {
	return value;
}
export function ensureString(value: string) {
	return value;
}

export class CoreType {
	static isNumber = isNumber;
	static isNumberValid = isNumberValid;
	static isVector = isVector;
	static isColor = isColor;
	static isEuler = isEuler;
	static isQuaternion = isQuaternion;
	static isString = isString;
	static isBoolean = isBoolean;
	static isNaN = coreTypeIsNaN;
	static isArray = isArray;
	static isObject = isObject;
	static isFunction = isFunction;
}
