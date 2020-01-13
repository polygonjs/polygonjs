import {Vector4} from 'three/src/math/Vector4';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
// const THREE = {BufferGeometry, Vector2, Vector3, Vector4}
import {CoreAttribute} from './Attribute';
import {CoreGeometry} from './Geometry';
// import Geometry from './Geometry';

const ATTRIB_NAMES = {
	POSITION: 'position',
	NORMAL: 'normal',
};

enum ComponentName {
	x = 'x',
	y = 'y',
	z = 'z',
	w = 'w',
	r = 'r',
	g = 'g',
	b = 'b',
}
const COMPONENT_INDICES = {
	x: 0,
	y: 1,
	z: 2,
	w: 3,
	r: 0,
	g: 1,
	b: 2,
};

const PTNUM = 'ptnum';
const DOT = '.';

export class CorePoint {
	_geometry: BufferGeometry;
	_position: Vector3;
	_normal: Vector3;

	constructor(private _core_geometry: CoreGeometry, private _index: number) {
		this._geometry = this._core_geometry.geometry();
	}

	geometry_wrapper() {
		return this._core_geometry;
	}
	geometry() {
		return (this._geometry = this._geometry || this._core_geometry.geometry());
	}

	index(): number {
		return this._index;
	}

	// add_attribute: (name, size, value)->
	// 	@_attributes[name] = new Attribute(size, value)

	attrib_size(name: string): number {
		//@_attributes[name].size()
		name = CoreAttribute.remap_name(name);
		return this._geometry.getAttribute(name).itemSize;
	}

	has_attrib(name: string): boolean {
		const remapped_name = CoreAttribute.remap_name(name);
		return this._core_geometry.has_attrib(remapped_name);
	}

	attrib_value(name: string) {
		//, target){ // target could be used, but not entirely sure I am ready now

		if (name === PTNUM) {
			return this.index();
		} else {
			let component_name = null;
			let component_index = null;
			if (name[name.length - 2] === DOT) {
				component_name = name[name.length - 1] as ComponentName;
				component_index = COMPONENT_INDICES[component_name];
				name = name.substring(0, name.length - 2);
			}
			const remaped_name = CoreAttribute.remap_name(name);

			//if (attrib = @_attributes[name])?
			const attrib = this._geometry.getAttribute(remaped_name);
			if (attrib) {
				const {array} = attrib;
				if (this._core_geometry.is_attrib_indexed(remaped_name)) {
					const value_index = this.attrib_value_index(remaped_name); //attrib.value()
					return this._core_geometry.user_data_attrib(remaped_name)[value_index];
				} else {
					const size = attrib.itemSize;
					const start_index = this._index * size;

					if (component_index == null) {
						switch (size) {
							case 1:
								return array[start_index];
								break;
							case 2:
								return new Vector2(array[start_index + 0], array[start_index + 1]);
								break;
							case 3:
								return new Vector3(
									array[start_index + 0],
									array[start_index + 1],
									array[start_index + 2]
								);
								// target.fromArray(array, start_index)
								break;
							case 4:
								return new Vector4(
									array[start_index + 0],
									array[start_index + 1],
									array[start_index + 2],
									array[start_index + 3]
								);
								break;
							default:
								throw `size not valid (${size})`;
						}
					} else {
						switch (size) {
							case 1:
								return array[start_index];
								break;
							default:
								return array[start_index + component_index];
						}
					}
				}
			} else {
				const message = `attrib ${name} not found. availables are: ${Object.keys(
					this._geometry.attributes || {}
				).join(',')}`;
				console.warn(message);
				throw message;
			}
		}
	}

	attrib_value_index(name: string) {
		if (this._core_geometry.is_attrib_indexed(name)) {
			//@_attributes[name].value()
			return this._geometry.getAttribute(name).array[this._index];
		} else {
			return -1;
		}
	}

	position(): Vector3 {
		//@_attributes['position'].value()
		const {array} = this._geometry.getAttribute(ATTRIB_NAMES.POSITION);
		this._position = this._position || new Vector3();
		return this._position.fromArray(array, this._index * 3);
	}
	set_position(new_position: Vector3) {
		this.set_attrib_value_vector3(ATTRIB_NAMES.POSITION, new_position);
	}

	normal(): Vector3 {
		const {array} = this._geometry.getAttribute(ATTRIB_NAMES.NORMAL);
		this._normal = this._normal || new Vector3();
		return this._normal.fromArray(array, this._index * 3);
	}
	set_normal(new_normal: Vector3) {
		return this.set_attrib_value_vector3(ATTRIB_NAMES.NORMAL, new_normal);
	}

	set_attrib_value(name: string, value: NumericAttribValue) {
		// TODO: this fails if the value is null
		if (value == null) {
			return;
		}
		if (name == null) {
			throw 'Point.set_attrib_value requires a name';
		}

		// attrib = @_attributes[name]
		// attrib.set_value(value)
		//value = attrib.value()
		//value = this.attrib_value()
		const attrib = this._geometry.getAttribute(name);
		const array = attrib.array as number[];
		const attrib_size = attrib.itemSize;

		switch (attrib_size) {
			case 1:
				array[this._index] = value as number;
				break;
			case 2:
				const v2 = value as Vector2Like;
				array[this._index * 2 + 0] = v2.x;
				array[this._index * 2 + 1] = v2.y;
				break;
			case 3:
				const is_color = (value as ColorLike).r != null;
				if (is_color) {
					const col = value as ColorLike;
					array[this._index * 3 + 0] = col.r;
					array[this._index * 3 + 1] = col.g;
					array[this._index * 3 + 2] = col.b;
				} else {
					const v3 = value as Vector3Like;
					array[this._index * 3 + 0] = v3.x;
					array[this._index * 3 + 1] = v3.y;
					array[this._index * 3 + 2] = v3.z;
				}
				break;
			default:
				console.warn(`Point.set_attrib_value does not yet allow attrib size ${attrib_size}`);
				throw `attrib size ${attrib_size} not implemented`;
		}
	}
	set_attrib_value_vector3(name: string, value: Vector3) {
		// TODO: this fails if the value is null
		if (value == null) {
			return;
		}
		if (name == null) {
			throw 'Point.set_attrib_value requires a name';
		}

		const attrib = this._geometry.getAttribute(name);
		const array = attrib.array as number[];
		const i = this._index * 3;

		array[i] = value.x;
		array[i + 1] = value.y;
		array[i + 2] = value.z;
	}

	set_attrib_index(name: string, new_value_index: number) {
		// attrib = @_attributes[name]
		// attrib.set_value(new_value_index)
		//value = attrib.value()
		const array = this._geometry.getAttribute(name).array as number[];
		return (array[this._index] = new_value_index);
	}
}
