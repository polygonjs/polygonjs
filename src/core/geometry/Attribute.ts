import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {BufferAttribute} from 'three/src/core/BufferAttribute';

export enum Attribute {
	POSITION = 'position',
	NORMAL = 'normal',
	TANGENT = 'tangent',
}

const ATTRIB_NAME_MAP: Dictionary<string> = {
	P: 'position',
	N: 'normal',
	Cd: 'color',
};

export class CoreAttribute {
	static remap_name(name: string): string {
		return ATTRIB_NAME_MAP[name] || name;
	}

	static array_to_indexed_arrays(array: string[]) {
		const index_by_value: Dictionary<number> = {};
		let current_index = 0;
		const indices = [];
		const values = [];

		let i = 0;
		while (i < array.length) {
			//(value = array[i++])?
			const value = array[i];
			const index = index_by_value[value];
			if (index != null) {
				indices.push(index);
			} else {
				values.push(value);
				indices.push(current_index);
				index_by_value[value] = current_index;
				current_index += 1;
			}

			i++;
		}

		return {
			indices,
			values,
		};
	}

	static default_value(size: number) {
		switch (size) {
			case 1:
				return 0;
			case 2:
				return new Vector2(0, 0);
			case 3:
				return new Vector3(0, 0, 0);
			default:
				throw `size ${size} not yet implemented`;
		}
	}

	static copy(src: BufferAttribute, dest: BufferAttribute, mark_as_needs_update = true) {
		const src_array = src?.array as number[] | undefined;
		const dest_array = dest?.array as number[] | undefined;
		if (src_array && dest_array) {
			const min_length = Math.min(src_array.length, dest_array.length);
			for (let i = 0; i < min_length; i++) {
				dest_array[i] = src_array[i];
			}

			if (mark_as_needs_update) {
				dest.needsUpdate = true;
			}
		}
	}
}
