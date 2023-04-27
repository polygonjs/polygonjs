import {Euler, Vector2, Vector3, Vector4, Quaternion, Color} from 'three';

export function isArray(value: any): value is any[] {
	return Array.isArray(value);
}
export function isBoolean(value: any): value is boolean {
	return value === true || value === false;
}
export function isPromise<T extends any>(value: any): value is Promise<T> {
	return value instanceof Promise;
}
export function isNumber(value: any): value is number {
	return typeof value == 'number';
}
export function isString(value: any): value is string {
	return typeof value == 'string';
}
export function isColor(value: any): value is Color {
	return value instanceof Color;
}
export function isVector(value: any): value is Vector2 | Vector3 | Vector4 {
	return value instanceof Vector2 || value instanceof Vector3 || value instanceof Vector4;
}
export class CoreType {
	static isNumber = isNumber;
	static isVector = isVector;
	static isColor = isColor;
	static isEuler(value: any): value is Euler {
		return value instanceof Euler;
	}
	static isQuaternion(value: any): value is Quaternion {
		return value instanceof Quaternion;
	}
	static isString = isString;
	static isBoolean = isBoolean;
	static isNaN(value: any): boolean {
		return isNaN(value);
	}
	static isNumberValid(value: any): value is number {
		return this.isNumber(value) && !this.isNaN(value);
	}
	static isArray = isArray;
	static isObject(value: any): value is object {
		var type = typeof value;
		return value != null && (type == 'object' || type == 'function');
	}
	static isFunction(value: any): value is Function {
		var type = typeof value;
		return value != null && type == 'function';
	}
}

// a simple way to test the type and value of a param value
export function isBooleanTrue(value: boolean) {
	return value;
}
export function ensureString(value: string) {
	return value;
}
