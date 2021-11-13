import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Vector4} from 'three/src/math/Vector4';

export class CoreType {
	static isNumber(value: any): value is number {
		return typeof value == 'number';
	}
	static isVector(value: any): value is Vector2 | Vector3 | Vector4 {
		return value instanceof Vector2 || value instanceof Vector3 || value instanceof Vector4;
	}
	static isString(value: any): value is string {
		return typeof value == 'string';
	}
	static isBoolean(value: any): value is boolean {
		return value === true || value === false;
	}
	static isNaN(value: any): boolean {
		return isNaN(value);
	}
	static isArray(value: any): value is any[] {
		return Array.isArray(value);
	}
	static isObject(value: any): value is object {
		var type = typeof value;
		return value != null && (type == 'object' || type == 'function');
	}
}

// a simple way to test the type and value of a param value
export function isBooleanTrue(value: boolean) {
	return value;
}
export function ensureString(value: string) {
	return value;
}
