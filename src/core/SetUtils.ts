export function setFirstValue<K>(set: Set<K>): K | undefined {
	for (const k of set) {
		return k;
	}
}
let i = 0;
export function setToArray<T>(set: Set<T>, target: T[]): T[] {
	// const array: Array<T> = [];
	target.length = set.size;
	i = 0;
	set.forEach((elem) => {
		target[i] = elem;
		i++;
	});
	return target;
}
export function setFromArray<T>(array: T[], target?: Set<T>): Set<T> {
	if (target) {
		target.clear();
	} else {
		target = new Set<T>();
	}
	for (const element of array) {
		target.add(element);
	}
	return target;
}
export function setUnion<T extends string | number>(set0: Set<T>, set1: Set<T>): Set<T> {
	const newSet: Set<T> = new Set();
	set0.forEach((val) => newSet.add(val));
	set1.forEach((val) => newSet.add(val));
	return newSet;
}
export function setIntersection<T extends string | number>(set0: Set<T>, set1: Set<T>): Set<T> {
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
export function setDifference<T extends string | number>(set0: Set<T>, set1: Set<T>): Set<T> {
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

export class SetUtils {
	static setFirstValue = setFirstValue;
	static toArray = setToArray;
	static fromArray = setFromArray;
	static union = setUnion;
	static intersection = setIntersection;
	static difference = setDifference;
}
