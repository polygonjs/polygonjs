export function setFirstValue<K>(set: Set<K>): K | undefined {
	for (const item of set) {
		return item;
	}
}
let i = 0;
export function setToArray<T>(set: Set<T>, target: T[]): T[] {
	target.length = set.size;
	i = 0;
	for (const item of set) {
		target[i] = item;
		i++;
	}
	return target;
}
export function setCopy<T>(src: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	for (const item of src) {
		target.add(item);
	}
	return target;
}
export function setUnion<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	for (const item of set0) {
		target.add(item);
	}
	for (const item of set1) {
		target.add(item);
	}
	return target;
}
export function setIntersection<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	for (const item of set0) {
		if (set1.has(item)) {
			target.add(item);
		}
	}
	for (const item of set1) {
		if (set0.has(item)) {
			target.add(item);
		}
	}
	return target;
}
export function setDifference<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	for (const item of set0) {
		if (!set1.has(item)) {
			target.add(item);
		}
	}
	return target;
}
export function setXOR<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	for (const item of set0) {
		if (!set1.has(item)) {
			target.add(item);
		}
	}
	for (const item of set1) {
		if (!set0.has(item)) {
			target.add(item);
		}
	}
	return target;
}
