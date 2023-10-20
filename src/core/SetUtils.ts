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

export function setUnion<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	set0.forEach((val) => target.add(val));
	set1.forEach((val) => target.add(val));
	return target;
}
export function setIntersection<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	set0.forEach((val) => {
		if (set1.has(val)) {
			target.add(val);
		}
	});
	set1.forEach((val) => {
		if (set0.has(val)) {
			target.add(val);
		}
	});
	return target;
}
export function setDifference<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	set0.forEach((val) => {
		if (!set1.has(val)) {
			target.add(val);
		}
	});
	return target;
}
export function setXOR<T extends string | number>(set0: Set<T>, set1: Set<T>, target: Set<T>): Set<T> {
	target.clear();
	set0.forEach((val) => {
		if (!set1.has(val)) {
			target.add(val);
		}
	});
	set1.forEach((val) => {
		if (!set0.has(val)) {
			target.add(val);
		}
	});
	return target;
}
