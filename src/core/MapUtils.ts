export class MapUtils {
	static arrayFromValues<K, V>(map: Map<K, V>): Array<V> {
		const array: Array<V> = [];
		map.forEach((v) => {
			array.push(v);
		});
		return array;
	}
	static pushOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElement: V) {
		let has_entry = map.has(key);
		if (has_entry) {
			map.get(key)!.push(newElement);
		} else {
			map.set(key, [newElement]);
		}
	}
	static addToSetAtEntry<K, V>(map: Map<K, Set<V>>, key: K, newElement: V) {
		let has_entry = map.has(key);
		if (has_entry) {
			map.get(key)!.add(newElement);
		} else {
			const set: Set<V> = new Set();
			set.add(newElement);
			map.set(key, set);
		}
	}
	static popFromArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, elementToRemove: V) {
		let has_entry = map.has(key);
		if (has_entry) {
			const array = map.get(key)!;
			const index = array.indexOf(elementToRemove);
			if (index >= 0) {
				array.splice(index, 1);
			}
		}
	}
	static removeFromSetAtEntry<K, V>(map: Map<K, Set<V>>, key: K, elementToRemove: V) {
		let has_entry = map.has(key);
		if (has_entry) {
			const set = map.get(key)!;
			set.delete(elementToRemove);
			if (set.size == 0) {
				map.delete(key);
			}
		}
	}

	static unshiftOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElement: V) {
		let has_entry = map.has(key);
		if (has_entry) {
			map.get(key)!.unshift(newElement);
		} else {
			map.set(key, [newElement]);
		}
	}
	static concatOnArrayAtEntry<K, V>(map: Map<K, V[]>, key: K, newElements: V[]) {
		let has_entry = map.has(key);
		if (has_entry) {
			let array: V[] = map.get(key)!;
			for (let element of newElements) {
				array.push(element);
			}
		} else {
			map.set(key, newElements);
		}
	}
}
