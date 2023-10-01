type GroupByCallback<T, K> = (arg: T) => K;

export function mapFirstKey<K>(map: Map<K, any>): K | undefined {
	for (const [k] of map) {
		return k;
	}
}
export function pushOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElement: V) {
	if (map.has(key)) {
		map.get(key)!.push(newElement);
	} else {
		map.set(key, [newElement]);
	}
}
export function popFromArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, elementToRemove: V, removeFromMapIfEmpty = true) {
	if (map.has(key)) {
		const array = map.get(key)!;
		const index = array.indexOf(elementToRemove);
		if (index >= 0) {
			array.splice(index, 1);
			if (removeFromMapIfEmpty && array.length == 0) {
				map.delete(key);
			}
		}
	}
}
export function addToSetAtEntry<K, V>(map: Map<K, Set<V>>, key: K, newElement: V) {
	if (map.has(key)) {
		map.get(key)!.add(newElement);
	} else {
		const set: Set<V> = new Set();
		set.add(newElement);
		map.set(key, set);
	}
}
export function addToMapAtEntry<K0, K1, V>(map: Map<K0, Map<K1, V>>, key0: K0, key1: K1, newElement: V) {
	let subMap = map.get(key0);
	if (!subMap) {
		subMap = new Map();
		map.set(key0, subMap);
	}
	subMap.set(key1, newElement);
}
export function getMapElementAtEntry<K0, K1, V>(map: Map<K0, Map<K1, V>>, key0: K0, key1: K1): V | undefined {
	let subMap = map.get(key0);
	if (!subMap) {
		return;
	}
	return subMap.get(key1);
}
export function mapValuesToArray<K, V>(map: Map<K, V>, target: Array<V>): Array<V> {
	target.length = 0;
	map.forEach((v) => {
		target.push(v);
	});
	return target;
}
export function removeFromSetAtEntry<K, V>(map: Map<K, Set<V>>, key: K, elementToRemove: V) {
	if (map.has(key)) {
		const set = map.get(key)!;
		set.delete(elementToRemove);
		if (set.size == 0) {
			map.delete(key);
		}
	}
}
export function unshiftOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElement: V) {
	if (map.has(key)) {
		map.get(key)!.unshift(newElement);
	} else {
		map.set(key, [newElement]);
	}
}
export function concatOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElements: V[]) {
	if (map.has(key)) {
		let array: V[] = map.get(key)!;
		for (const element of newElements) {
			array.push(element);
		}
	} else {
		map.set(key, newElements);
	}
}
// export async function mapForEachSync<K, V>(map: Map<K, V>, callback: (v: V, k: K) => Promise<void>) {
// 	const values: V[] = [];
// 	const keys: K[] = [];
// 	map.forEach((value, key) => {
// 		values.push(value);
// 		keys.push(key);
// 	});
// 	for (let i = 0; i < values.length; i++) {
// 		const key = keys[i];
// 		const value = values[i];
// 		await callback(value, key);
// 	}
// }
export function mapGroupBy<T, K>(array: readonly T[], callback: GroupByCallback<T, K>): Map<K, T[]> {
	const map = new Map<K, T[]>();
	array.forEach((element: T) => {
		const key: K = callback(element);
		pushOnArrayAtEntry(map, key, element);
	});
	return map;
}
export function mapIncrementAtEntry<K>(map: Map<K, number>, key: K, initValue: number): number {
	let entry = map.get(key);
	if (entry == null) {
		entry = initValue;
	}
	entry++;
	map.set(key, entry);
	return entry;
}
export function mapEntriesCount<K, V>(map: Map<K, V>): number {
	let count = 0;
	map.forEach(() => {
		count++;
	});
	return count;
}
export class MapUtils {
	// static arrayFromValues = mapValuesToArray;
	static pushOnArrayAtEntry = pushOnArrayAtEntry;
	static addToSetAtEntry = addToSetAtEntry;
	static popFromArrayAtEntry = popFromArrayAtEntry;
	static removeFromSetAtEntry = removeFromSetAtEntry;
	static unshiftOnArrayAtEntry = unshiftOnArrayAtEntry;
	static concatOnArrayAtEntry = concatOnArrayAtEntry;
	// static forEachSync = mapForEachSync;
	static groupBy = mapGroupBy;
	static incrementAtEntry = mapIncrementAtEntry;
	static firstKey = mapFirstKey;
}
