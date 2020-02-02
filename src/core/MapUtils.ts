export class MapUtils {
	static push_on_array_at_entry<K, V>(map: Map<K, V[]>, key: K, new_element: V) {
		let has_entry = map.has(key);
		if (has_entry) {
			map.get(key)!.push(new_element);
		} else {
			map.set(key, [new_element]);
		}
	}
	static unshift_on_array_at_entry<K, V>(map: Map<K, V[]>, key: K, new_element: V) {
		let has_entry = map.has(key);
		if (has_entry) {
			map.get(key)!.unshift(new_element);
		} else {
			map.set(key, [new_element]);
		}
	}
	static concat_on_array_at_entry<K, V>(map: Map<K, V[]>, key: K, new_elements: V[]) {
		let has_entry = map.has(key);
		if (has_entry) {
			let array: V[] = map.get(key)!;
			for (let element of new_elements) {
				array.push(element);
			}
		} else {
			map.set(key, new_elements);
		}
	}
}
