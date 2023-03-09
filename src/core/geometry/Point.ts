import {
	AttribValue,
	ColorLike,
	NumericAttribValue,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../types/GlobalTypes';
import {BufferAttribute, Vector4} from 'three';
import {Vector3} from 'three';
import {Vector2} from 'three';
import {BufferGeometry} from 'three';
import {Attribute, CoreAttribute} from './Attribute';
import {CoreGeometry} from './Geometry';
import {CoreEntity} from './Entity';
import {CoreType} from '../Type';
import {Matrix4} from 'three';

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
	static attribValue(
		geometry: BufferGeometry,
		index: number,
		attribName: string,
		target?: Vector2 | Vector3 | Vector4
	): AttribValue {
		if (attribName === Attribute.POINT_INDEX) {
			return index;
		} else {
			let component_name = null;
			let component_index = null;
			if (attribName[attribName.length - 2] === DOT) {
				component_name = attribName[attribName.length - 1] as ComponentName;
				component_index = COMPONENT_INDICES[component_name];
				attribName = attribName.substring(0, attribName.length - 2);
			}
			const remapedName = CoreAttribute.remapName(attribName);

			const attrib = geometry.getAttribute(remapedName) as BufferAttribute | undefined;
			if (attrib) {
				const {array} = attrib;
				if (CoreGeometry.isAttribIndexed(geometry, remapedName)) {
					return CorePoint.indexedAttribValue(geometry, index, remapedName);
				} else {
					const size = attrib.itemSize;
					const start_index = index * size;

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
				const message = `attrib ${attribName} not found. availables are: ${Object.keys(
					geometry.attributes || {}
				).join(',')}`;
				console.warn(message);
				throw message;
			}
		}
	}
	attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue {
		return CorePoint.attribValue(this._geometry, this._index, attribName, target);
		// if (name === Attribute.POINT_INDEX) {
		// 	return this.index();
		// } else {
		// 	let component_name = null;
		// 	let component_index = null;
		// 	if (name[name.length - 2] === DOT) {
		// 		component_name = name[name.length - 1] as ComponentName;
		// 		component_index = COMPONENT_INDICES[component_name];
		// 		name = name.substring(0, name.length - 2);
		// 	}
		// 	const remaped_name = CoreAttribute.remapName(name);

		// 	const attrib = this._geometry.getAttribute(remaped_name);
		// 	if (attrib) {
		// 		const {array} = attrib;
		// 		if (this._coreGeometry.isAttribIndexed(remaped_name)) {
		// 			return this.indexedAttribValue(remaped_name);
		// 		} else {
		// 			const size = attrib.itemSize;
		// 			const start_index = this._index * size;

		// 			if (component_index == null) {
		// 				switch (size) {
		// 					case 1:
		// 						return array[start_index];
		// 						break;
		// 					case 2:
		// 						target = target || new Vector2();
		// 						target.fromArray(array, start_index);
		// 						return target;
		// 						break;
		// 					case 3:
		// 						target = target || new Vector3();
		// 						target.fromArray(array, start_index);
		// 						return target;
		// 						break;
		// 					case 4:
		// 						target = target || new Vector4();
		// 						target.fromArray(array, start_index);
		// 						return target;
		// 						break;
		// 					default:
		// 						throw `size not valid (${size})`;
		// 				}
		// 			} else {
		// 				switch (size) {
		// 					case 1:
		// 						return array[start_index];
		// 						break;
		// 					default:
		// 						return array[start_index + component_index];
		// 				}
		// 			}
		// 		}
		// 	} else {
		// 		const message = `attrib ${name} not found. availables are: ${Object.keys(
		// 			this._geometry.attributes || {}
		// 		).join(',')}`;
		// 		console.warn(message);
		// 		throw message;
		// 	}
		// }
	}
	attribValueNumber(name: string) {
		const remapedName = CoreAttribute.remapName(name);
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		return attrib.array[this._index];
	}
	attribValueVector2(name: string, target: Vector2) {
		const remapedName = CoreAttribute.remapName(name);
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		target.fromArray(attrib.array, this._index * 2);
		return target;
	}
	attribValueVector3(name: string, target: Vector3) {
		const remapedName = CoreAttribute.remapName(name);
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		target.fromArray(attrib.array, this._index * 3);
		return target;
	}
	attribValueVector4(name: string, target: Vector4) {
		const remapedName = CoreAttribute.remapName(name);
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		target.fromArray(attrib.array, this._index * 4);
		return target;
	}
	static indexedAttribValue(geometry: BufferGeometry, index: number, attribName: string): string {
		const value_index = this.attribValueIndex(geometry, index, attribName); //attrib.value()
		return CoreGeometry.userDataAttrib(geometry, attribName)[value_index];
	}
	indexedAttribValue(name: string): string {
		const value_index = this.attribValueIndex(name); //attrib.value()
		return this._coreGeometry.userDataAttrib(name)[value_index];
	}
	stringAttribValue(name: string) {
		return this.indexedAttribValue(name);
	}
	static attribValueIndex(geometry: BufferGeometry, index: number, attribName: string): number {
		if (CoreGeometry.isAttribIndexed(geometry, attribName)) {
			return (geometry.getAttribute(attribName) as BufferAttribute).array[index];
		} else {
			return -1;
		}
	}
	attribValueIndex(attribName: string): number {
		return CorePoint.attribValueIndex(this._geometry, this._index, attribName);
		// if (this._coreGeometry.isAttribIndexed(name)) {
		// 	return this._geometry.getAttribute(name).array[this._index];
		// } else {
		// 	return -1;
		// }
	}
	isAttribIndexed(name: string) {
		return this._coreGeometry.isAttribIndexed(name);
	}

	position() {
		return this._position || (this._position = this.getPosition(new Vector3()));
	}

	getPosition(target: Vector3): Vector3 {
		const {array} = this._geometry.getAttribute(ATTRIB_NAMES.POSITION) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	setPosition(new_position: Vector3) {
		this.setAttribValueFromVector3(ATTRIB_NAMES.POSITION, new_position);
	}

	normal(): Vector3 {
		return (this._normal = this._normal || this.getNormal(new Vector3()));
	}
	getNormal(target: Vector3): Vector3 {
		const {array} = this._geometry.getAttribute(ATTRIB_NAMES.NORMAL) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	setNormal(new_normal: Vector3) {
		return this.setAttribValueFromVector3(ATTRIB_NAMES.NORMAL, new_normal);
	}

	setAttribValue(attribName: string, value: NumericAttribValue | string) {
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		const array = attrib.array as number[];
		const attribSize = attrib.itemSize;

		if (CoreType.isArray(value)) {
			for (let i = 0; i < attribSize; i++) {
				array[this._index * attribSize + i] = value[i];
			}
			return;
		}

		switch (attribSize) {
			case 1:
				array[this._index] = value as number;
				break;
			case 2:
				const v2 = value as Vector2Like;
				const i2 = this._index * 2;
				array[i2 + 0] = v2.x;
				array[i2 + 1] = v2.y;
				break;
			case 3:
				const isColor = (value as ColorLike).r != null;
				const i3 = this._index * 3;
				if (isColor) {
					const col = value as ColorLike;
					array[i3 + 0] = col.r;
					array[i3 + 1] = col.g;
					array[i3 + 2] = col.b;
				} else {
					const v3 = value as Vector3Like;
					array[i3 + 0] = v3.x;
					array[i3 + 1] = v3.y;
					array[i3 + 2] = v3.z;
				}
				break;
			case 4:
				const v4 = value as Vector4Like;
				const i4 = this._index * 4;
				array[i4 + 0] = v4.x;
				array[i4 + 1] = v4.y;
				array[i4 + 2] = v4.z;
				array[i4 + 3] = v4.w;
				break;
			default:
				console.warn(`Point.set_attrib_value does not yet allow attrib size ${attribSize}`);
				throw `attrib size ${attribSize} not implemented`;
		}
	}
	setAttribValueFromNumber(attribName: string, value: number) {
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		const array = attrib.array as number[];
		array[this._index] = value;
	}
	setAttribValueFromVector2(attribName: string, value: Vector2) {
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		value.toArray(attrib.array, this._index * 2);
	}
	setAttribValueFromVector3(attribName: string, value: Vector3) {
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		value.toArray(attrib.array, this._index * 3);
	}
	setAttribValueFromVector4(attribName: string, value: Vector4) {
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		value.toArray(attrib.array, this._index * 4);
	}
	// setAttribValueVector3(name: string, value: Vector3) {
	// 	// TODO: this fails if the value is null
	// 	if (value == null) {
	// 		return;
	// 	}
	// 	if (name == null) {
	// 		throw 'Point.set_attrib_value requires a name';
	// 	}

	// 	const attrib = this._geometry.getAttribute(name);
	// 	const array = attrib.array as number[];
	// 	value.toArray(array, this._index * 3);
	// }

	setAttribIndex(name: string, new_value_index: number) {
		const array = (this._geometry.getAttribute(name) as BufferAttribute).array as number[];
		return (array[this._index] = new_value_index);
	}
}
