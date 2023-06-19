type GroupByCallback<T, K> = (arg: T) => K;

export function mapFirstKey<K>(map: Map<K, any>): K | undefined {
	for (let [k] of map) {
		return k;
	}
}
export class MapUtils {
	static arrayFromValues<K, V>(map: Map<K, V>): Array<V> {
		const array: Array<V> = [];
		map.forEach((v) => {
			array.push(v);
		});
		return array;
	}
	static pushOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElement: V) {
		if (map.has(key)) {
			map.get(key)!.push(newElement);
		} else {
			map.set(key, [newElement]);
		}
	}
	static addToSetAtEntry<K, V>(map: Map<K, Set<V>>, key: K, newElement: V) {
		if (map.has(key)) {
			map.get(key)!.add(newElement);
		} else {
			const set: Set<V> = new Set();
			set.add(newElement);
			map.set(key, set);
		}
	}
	static popFromArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, elementToRemove: V) {
		if (map.has(key)) {
			const array = map.get(key)!;
			const index = array.indexOf(elementToRemove);
			if (index >= 0) {
				array.splice(index, 1);
			}
		}
	}
	static removeFromSetAtEntry<K, V>(map: Map<K, Set<V>>, key: K, elementToRemove: V) {
		if (map.has(key)) {
			const set = map.get(key)!;
			set.delete(elementToRemove);
			if (set.size == 0) {
				map.delete(key);
			}
		}
	}

	static unshiftOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElement: V) {
		if (map.has(key)) {
			map.get(key)!.unshift(newElement);
		} else {
			map.set(key, [newElement]);
		}
	}
	static concatOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElements: V[]) {
		if (map.has(key)) {
			let array: V[] = map.get(key)!;
			for (let element of newElements) {
				array.push(element);
			}
		} else {
			map.set(key, newElements);
		}
	}
	static async forEachSync<K, V>(map: Map<K, V>, callback: (v: V, k: K) => Promise<void>) {
		const values: V[] = [];
		const keys: K[] = [];
		map.forEach((value, key) => {
			values.push(value);
			keys.push(key);
		});
		for (let i = 0; i < values.length; i++) {
			const key = keys[i];
			const value = values[i];
			await callback(value, key);
		}
	}
	static groupBy<T, K>(array: readonly T[], callback: GroupByCallback<T, K>): Map<K, T[]> {
		const map = new Map<K, T[]>();
		array.forEach((element: T) => {
			const key: K = callback(element);
			this.pushOnArrayAtEntry(map, key, element);
		});
		return map;
	}
	static incrementAtEntry<K>(map: Map<K, number>, key: K, initValue: number): number {
		let entry = map.get(key);
		if (entry == null) {
			entry = initValue;
		}
		entry++;
		map.set(key, entry);
		return entry;
	}
	static firstKey = mapFirstKey;
}
