import {MapUtils} from './MapUtils';
import {CoreType} from './Type';

export class ArrayUtils {
	static min<T>(array: Array<T>): T {
		let min = array[0];
		for (let element of array) {
			if (element < min) {
				min = element;
			}
		}
		return min;
	}
	static max<T>(array: Array<T>): T {
		let min = array[0];
		for (let element of array) {
			if (element > min) {
				min = element;
			}
		}
		return min;
	}
	static sum(array: number[]): number {
		let sum = 0;
		for (let element of array) {
			sum += element;
		}
		return sum;
	}
	static compact<T>(array: Array<T | null | undefined>): Array<T> {
		const new_array: Array<T> = [];

		for (let elem of array) {
			if (elem != null) {
				new_array.push(elem);
			}
		}

		return new_array;
	}
	static uniq<T>(array: Array<T>): Array<T> {
		const tmp_set: Set<T> = new Set();

		for (let elem of array) {
			tmp_set.add(elem);
		}

		const new_array: Array<T> = new Array(tmp_set.size);
		let i = 0;
		tmp_set.forEach((elem) => {
			new_array[i] = elem;
			i++;
		});

		return new_array;
	}
	static sortBy<T, K extends number | string>(array: Array<T>, callback: (e: T) => K): Array<T> {
		if (array.length == 0) {
			return [];
		}
		const elements_by_value: Map<K, T[]> = new Map();
		const values_set: Set<K> = new Set();
		for (let elem of array) {
			const value: K = callback(elem);
			values_set.add(value);
			MapUtils.push_on_array_at_entry(elements_by_value, value, elem);
		}
		const values: K[] = new Array(values_set.size);
		let i = 0;
		values_set.forEach((value) => {
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
		for (let value of values) {
			const elements_for_value = elements_by_value.get(value);
			if (elements_for_value) {
				for (let element of elements_for_value) {
					sorted_elements[i] = element;
					i++;
				}
			}
		}
		return sorted_elements;
	}

	static range(start: number, end?: number, step: number = 1): number[] {
		if (end == null) {
			end = start;
			start = 0;
		}
		const length = Math.floor((end - start) / step);
		const array: number[] = new Array(length);

		for (let i = 0; i < array.length; i++) {
			array[i] = start + i * step;
		}
		return array;
	}
}
