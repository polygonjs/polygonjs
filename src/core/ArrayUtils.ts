import {MapUtils} from './MapUtils';
import {SetUtils} from './SetUtils';
import {CoreType} from './Type';
import {randFloat} from './math/_Module';

export type ArrayToItemFunction<T> = (array: Array<T>) => T;

export function range(start: number, end: number, step: number, target: number[]): number[] {
	if (end == null) {
		end = start;
		start = 0;
	}
	const length = Math.floor((end - start) / step);
	target.length = length;

	for (let i = 0; i < length; i++) {
		target[i] = start + i * step;
	}
	return target;
}
export function rangeWithEnd(end: number): number[] {
	const target: number[] = [];
	range(0, end, 1, target);
	return target;
}
export function rangeStartEnd(start: number, end: number): number[] {
	const target: number[] = [];
	range(start, end, 1, target);
	return target;
}
export function arrayUniq<T>(array: Array<T>, target: Array<T>): Array<T> {
	target.length = 0;
	for (const element of array) {
		if (!target.includes(element)) {
			target.push(element);
		}
	}
	return target;
	// if we use a set, we lose the order
	// const tmpSet: Set<T> = new Set();

	// for (let elem of array) {
	// 	tmpSet.add(elem);
	// }

	// const newArray: Array<T> = new Array(tmpSet.size);
	// let i = 0;
	// tmpSet.forEach((elem) => {
	// 	newArray[i] = elem;
	// 	i++;
	// });

	// return newArray;
}
export function sampleIndex(array: Array<any>, seed: number): number {
	return Math.floor(randFloat(seed) * array.length);
}
export function sample<T>(array: Array<T>, seed: number): T | undefined {
	return array[sampleIndex(array, seed)];
}
export function spliceSample<T>(array: Array<T>, seed: number): T | undefined {
	return array.splice(sampleIndex(array, seed), 1)[0];
}
const tmpSet: Set<any> = new Set();
export function uniqWithoutPreservingOrder<T>(array: Array<T>): Array<T> {
	SetUtils.fromArray(array, tmpSet);
	return SetUtils.toArray(tmpSet, []);

	// for (let elem of array) {
	// 	tmpSet.add(elem);
	// }

	// const newArray: Array<T> = new Array(tmpSet.size);
	// let i = 0;
	// tmpSet.forEach((elem) => {
	// 	newArray[i] = elem;
	// 	i++;
	// });

	// return newArray;
}
export function arrayCompact<T>(array: Readonly<Array<T | null | undefined>>, target: Array<T>): Array<T> {
	target.length = 0;

	for (const elem of array) {
		if (elem != null) {
			target.push(elem);
		}
	}

	return target;
}
export function arrayMin<T>(array: Array<T>): T {
	let min = array[0];
	for (const element of array) {
		if (element < min) {
			min = element;
		}
	}
	return min;
}
export function arrayMax<T>(array: Array<T>): T {
	let max = array[0];
	for (const element of array) {
		if (element > max) {
			max = element;
		}
	}
	return max;
}
export function arraySum(array: number[]): number {
	let sum = 0;
	for (const element of array) {
		sum += element;
	}
	return sum;
}
export function arrayChunk<T extends number | string>(array: Array<T>, chunkSize: number): Array<Array<T>> {
	const newArray: Array<Array<T>> = [];

	let newSubArray: Array<T> = [];
	newArray.push(newSubArray);
	for (let i = 0; i < array.length; i++) {
		if (newSubArray.length == chunkSize) {
			newSubArray = [];
			newArray.push(newSubArray);
		}
		newSubArray.push(array[i]);
	}

	return newArray;
}
export function arrayUnion<T extends number | string>(array0: Array<T>, array1: Array<T>, target: Array<T>): Array<T> {
	target.length = 0;
	const unionSet = SetUtils.union(arrayToSet(array0), arrayToSet(array1));
	unionSet.forEach((val) => target.push(val));

	return target;
}
export function arrayIntersection<T extends number | string>(
	array0: Array<T>,
	array1: Array<T>,
	target: Array<T>
): Array<T> {
	target.length = 0;
	const intersectionSet = SetUtils.intersection(arrayToSet(array0), arrayToSet(array1));
	intersectionSet.forEach((val) => target.push(val));

	return target;
}
export function arrayDifference<T extends number | string>(
	array0: Array<T>,
	array1: Array<T>,
	target: Array<T>
): Array<T> {
	target.length = 0;
	const differenceSet = SetUtils.difference(arrayToSet(array0), arrayToSet(array1));
	differenceSet.forEach((val) => target.push(val));

	return target;
}
export function arrayToSet<T extends number | string>(array: Array<T>): Set<T> {
	const set: Set<T> = new Set();
	for (const elem of array) {
		set.add(elem);
	}
	return set;
}
export function arrayIsEqual<T extends number | string>(array0: Array<T>, array1: Array<T>): boolean {
	if (array0.length != array1.length) {
		return false;
	}
	const count = array0.length;
	for (let i = 0; i < count; i++) {
		if (array0[i] != array1[i]) {
			return false;
		}
	}
	return true;
}
export function arraySortBy<T, K extends number | string>(array: Array<T>, callback: (e: T) => K): Array<T> {
	if (array.length == 0) {
		return [];
	}
	const elementsByValue: Map<K, T[]> = new Map();
	const valuesSet: Set<K> = new Set();
	for (const elem of array) {
		const value: K = callback(elem);
		valuesSet.add(value);
		MapUtils.pushOnArrayAtEntry(elementsByValue, value, elem);
	}
	const values: K[] = new Array(valuesSet.size);
	let i = 0;
	valuesSet.forEach((value) => {
		values[i] = value;
		i++;
	});

	// sort differently if the callback return value is a string or a number
	if (CoreType.isString(values[0])) {
		values.sort();
	} else {
		values.sort((a, b) => (a as number) - (b as number));
	}

	const sorted_elements: Array<T> = new Array(array.length);
	i = 0;
	for (const value of values) {
		const elements_for_value = elementsByValue.get(value);
		if (elements_for_value) {
			for (const element of elements_for_value) {
				sorted_elements[i] = element;
				i++;
			}
		}
	}
	return sorted_elements;
}
export function arrayShallowClone<T>(array: Array<T>): Array<T> {
	// https://stackoverflow.com/questions/3978492/fastest-way-to-duplicate-an-array-in-javascript-slice-vs-for-loop
	return [...array];
}

export class ArrayUtils {
	static shallowClone = arrayShallowClone;
	static min = arrayMin;
	static max = arrayMax;
	static sum = arraySum;
	static compact = arrayCompact;
	static uniq = arrayUniq;
	static uniqWithoutPreservingOrder = uniqWithoutPreservingOrder;
	static chunk = arrayChunk;
	static union = arrayUnion;
	static intersection = arrayIntersection;
	static difference = arrayDifference;
	static toSet = arrayToSet;
	static isEqual = arrayIsEqual;
	static sortBy = arraySortBy;
	static range = range;
}

const MAX_ITEMS_LENGTH = 1024;
export function arrayPushItems<T>(array: Array<T>, items: Readonly<Array<T>>) {
	// we avoid the standard
	// array.push(...items),
	// as this can trigger an
	// 'Maximum call stack size exceeded' error
	// on some large items array.
	// So instead, we push them elements one by one if items.length is above a threshold
	if (items.length <= MAX_ITEMS_LENGTH) {
		array.push(...items);
	} else {
		for (const item of items) {
			array.push(item);
		}
	}
}

export function arrayCopy<T>(srcArray: Readonly<Array<T>>, targetArray: Array<T>): void {
	targetArray.length = 0;
	arrayPushItems(targetArray, srcArray);
}
