import {arrayIsEqual} from './ArrayUtils';
import {CoreType} from './Type';
import cloneDeep from 'lodash-es/cloneDeep';
import clone from 'lodash-es/clone';

export function getObjectMethodNames(obj: any): string[] {
	let properties = new Set();
	let currentObj = obj;
	do {
		Object.getOwnPropertyNames(currentObj).map((item) => properties.add(item));
	} while ((currentObj = Object.getPrototypeOf(currentObj)));
	return [...properties.keys()].filter((item) => typeof (obj as any)[item as string] === 'function') as string[];
}

export class ObjectUtils {
	// static isObject(value: any): boolean {
	// 	var type = typeof value;
	// 	return value != null && (type == 'object' || type == 'function');
	// }
	static isEqual(object0: any, object1: any): boolean {
		if (CoreType.isBoolean(object0) && CoreType.isBoolean(object1)) {
			return object0 == object1;
		}
		if (CoreType.isNumber(object0) && CoreType.isNumber(object1)) {
			return object0 == object1;
		}
		if (CoreType.isString(object0) && CoreType.isString(object1)) {
			return object0 == object1;
		}

		if (CoreType.isObject(object0) && CoreType.isObject(object1)) {
			const keys0 = Object.keys(object0);
			const keys1 = Object.keys(object1);
			if (!arrayIsEqual(keys0, keys1)) {
				return false;
			}
			return JSON.stringify(object0) == JSON.stringify(object1);
		}
		return false;
	}
	static merge(object0: object, object1: object): object {
		return Object.assign(object0, object1);
	}
	static clone<T extends Array<any> | object | undefined>(value: T): T {
		// return this.cloneDeep(value);
		return clone(value);
		// if (value) {
		// 	if (CoreType.isArray(value)) {
		// 		const newValues: Array<any> = value.map((v) => v);
		// 		return newValues as T;
		// 	} else {
		// 		return {...value};
		// 	}
		// }
		// return value;
	}
	static cloneDeep<T extends object | number | string | boolean | undefined>(value: T): T {
		// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore/issues/121
		// let target = {};
		// for (const prop in src) {
		// 	if (src.hasOwnProperty(prop)) {
		// 		if ((src as any)[prop] != null && typeof (src as any)[prop] === 'object') {
		// 			(target as any)[prop] = this.cloneDeep((src as any)[prop]);
		// 		} else {
		// 			(target as any)[prop] = (src as any)[prop];
		// 		}
		// 	}
		// }
		// return target as T;

		return cloneDeep(value);
		// if (CoreType.isString(value) || CoreType.isNumber(value) || CoreType.isBoolean(value)) {
		// 	return value;
		// }
		// if (this.isObject(value)) {
		// be careful, as this does not clone functions
		// 	return JSON.parse(JSON.stringify(value));
		// }
		// return value;
	}
}
