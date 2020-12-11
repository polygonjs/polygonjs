export class MapUtils {
  static push_on_array_at_entry(map, key, new_element) {
    let has_entry = map.has(key);
    if (has_entry) {
      map.get(key).push(new_element);
    } else {
      map.set(key, [new_element]);
    }
  }
  static pop_from_array_at_entry(map, key, element_to_remove) {
    let has_entry = map.has(key);
    if (has_entry) {
      const array = map.get(key);
      const index = array.indexOf(element_to_remove);
      if (index >= 0) {
        array.splice(index, 1);
      }
    }
  }
  static unshift_on_array_at_entry(map, key, new_element) {
    let has_entry = map.has(key);
    if (has_entry) {
      map.get(key).unshift(new_element);
    } else {
      map.set(key, [new_element]);
    }
  }
  static concat_on_array_at_entry(map, key, new_elements) {
    let has_entry = map.has(key);
    if (has_entry) {
      let array = map.get(key);
      for (let element of new_elements) {
        array.push(element);
      }
    } else {
      map.set(key, new_elements);
    }
  }
}
