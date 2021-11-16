import {
	AttribValue,
	ColorLike,
	NumericAttribValue,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../types/GlobalTypes';
import {Vector4} from 'three/src/math/Vector4';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreAttribute} from './Attribute';
import {CoreGeometry} from './Geometry';
import {CoreEntity} from './Entity';
import {CoreType} from '../Type';
import {Matrix4} from 'three/src/math/Matrix4';

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

export class CorePoint extends CoreEntity {
	_geometry: BufferGeometry;
	_position: Vector3 | undefined;
	_normal: Vector3 | undefined;

	constructor(private _coreGeometry: CoreGeometry, _index: number) {
		super(_index);
		this._geometry = this._coreGeometry.geometry();
	}
	applyMatrix4(matrix: Matrix4) {
		this.position().applyMatrix4(matrix);
	}

	coreGeometry() {
		return this._coreGeometry;
	}
	geometry() {
		return (this._geometry = this._geometry || this._coreGeometry.geometry());
	}

	attribSize(name: string): number {
		name = CoreAttribute.remapName(name);
		return this._geometry.getAttribute(name).itemSize;
	}

	hasAttrib(name: string): boolean {
		const remapped_name = CoreAttribute.remapName(name);
		return this._coreGeometry.hasAttrib(remapped_name);
	}

	attribValue(name: string, target?: Vector2 | Vector3 | Vector4): AttribValue {
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
			const remaped_name = CoreAttribute.remapName(name);

			const attrib = this._geometry.getAttribute(remaped_name);
			if (attrib) {
				const {array} = attrib;
				if (this._coreGeometry.isAttribIndexed(remaped_name)) {
					return this.indexedAttribValue(remaped_name);
				} else {
					const size = attrib.itemSize;
					const start_index = this._index * size;

					if (component_index == null) {
						switch (size) {
							case 1:
								return array[start_index];
								break;
							case 2:
								target = target || new Vector2();
								target.fromArray(array, start_index);
								return target;
								break;
							case 3:
								target = target || new Vector3();
								target.fromArray(array, start_index);
								return target;
								break;
							case 4:
								target = target || new Vector4();
								target.fromArray(array, start_index);
								return target;
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

	indexedAttribValue(name: string): string {
		const value_index = this.attribValueIndex(name); //attrib.value()
		return this._coreGeometry.userDataAttrib(name)[value_index];
	}
	stringAttribValue(name: string) {
		return this.indexedAttribValue(name);
	}

	attribValueIndex(name: string): number {
		if (this._coreGeometry.isAttribIndexed(name)) {
			return this._geometry.getAttribute(name).array[this._index];
		} else {
			return -1;
		}
	}
	isAttribIndexed(name: string) {
		return this._coreGeometry.isAttribIndexed(name);
	}

	position() {
		return this._position || (this._position = this.getPosition(new Vector3()));
	}

	getPosition(target: Vector3): Vector3 {
		const {array} = this._geometry.getAttribute(ATTRIB_NAMES.POSITION);
		return target.fromArray(array, this._index * 3);
	}
	setPosition(new_position: Vector3) {
		this.setAttribValueVector3(ATTRIB_NAMES.POSITION, new_position);
	}

	normal(): Vector3 {
		return (this._normal = this._normal || this.getNormal(new Vector3()));
	}
	getNormal(target: Vector3): Vector3 {
		const {array} = this._geometry.getAttribute(ATTRIB_NAMES.NORMAL);
		return target.fromArray(array, this._index * 3);
	}
	setNormal(new_normal: Vector3) {
		return this.setAttribValueVector3(ATTRIB_NAMES.NORMAL, new_normal);
	}

	setAttribValue(name: string, value: NumericAttribValue | string) {
		// TODO: this fails if the value is null
		if (value == null) {
			return;
		}
		if (name == null) {
			throw 'Point.set_attrib_value requires a name';
		}

		const attrib = this._geometry.getAttribute(name);
		const array = attrib.array as number[];
		const attrib_size = attrib.itemSize;

		if (CoreType.isArray(value)) {
			for (let i = 0; i < attrib_size; i++) {
				array[this._index * attrib_size + i] = value[i];
			}
			return;
		}

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
			case 4:
				const v4 = value as Vector4Like;
				array[this._index * 4 + 0] = v4.x;
				array[this._index * 4 + 1] = v4.y;
				array[this._index * 4 + 2] = v4.z;
				array[this._index * 4 + 3] = v4.w;
				break;
			default:
				console.warn(`Point.set_attrib_value does not yet allow attrib size ${attrib_size}`);
				throw `attrib size ${attrib_size} not implemented`;
		}
	}
	setAttribValueVector3(name: string, value: Vector3) {
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

	setAttribIndex(name: string, new_value_index: number) {
		const array = this._geometry.getAttribute(name).array as number[];
		return (array[this._index] = new_value_index);
	}
}
