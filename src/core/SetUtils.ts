export class SetUtils {
	static toArray<T>(set: Set<T>) {
		const array: Array<T> = [];
		set.forEach((elem) => {
			array.push(elem);
		});
		return array;
	}
	static union<T extends string | number>(set0: Set<T>, set1: Set<T>): Set<T> {
		const newSet: Set<T> = new Set();
		set0.forEach((val) => newSet.add(val));
		set1.forEach((val) => newSet.add(val));
		return newSet;
	}
	static intersection<T extends string | number>(set0: Set<T>, set1: Set<T>): Set<T> {
		const newSet: Set<T> = new Set();
		set0.forEach((val) => {
			if (set1.has(val)) {
				newSet.add(val);
			}
		});
		set1.forEach((val) => {
			if (set0.has(val)) {
				newSet.add(val);
			}
		});
		return newSet;
	}
	static difference<T extends string | number>(set0: Set<T>, set1: Set<T>): Set<T> {
		const newSet: Set<T> = new Set();
		set0.forEach((val) => {
			if (!set1.has(val)) {
				newSet.add(val);
			}
		});
		set1.forEach((val) => {
			if (!set0.has(val)) {
				newSet.add(val);
			}
		});
		return newSet;
	}
}
