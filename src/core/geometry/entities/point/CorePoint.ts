import {
	AttribValue,
	ColorLike,
	NumericAttribValue,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../../../types/GlobalTypes';
import {BufferAttribute, Vector4, Vector3, Vector2, BufferGeometry} from 'three';
import {Attribute, CoreAttribute} from '../../Attribute';
import {CoreGeometry} from '../../Geometry';
import {CoreEntity} from '../../Entity';
import {isArray} from '../../../Type';
import {DOT, ComponentName, COMPONENT_INDICES} from '../../Constant';
import {CoreObjectType, ObjectBuilder} from '../../ObjectContent';

export class CorePoint extends CoreEntity {
	// _position: Vector3 | undefined;
	// _normal: Vector3 | undefined;
	private _geometry?: BufferGeometry;
	constructor(geometry?: BufferGeometry, index?: number) {
		super(geometry, index);
		this._geometry = geometry;
	}
	// applyMatrix4(matrix: Matrix4) {
	// 	this.position().applyMatrix4(matrix);
	// }
	setGeometry(geometry: BufferGeometry) {
		this._geometry = geometry;
		return this;
	}
	override setIndex(index: number, geometry?: BufferGeometry) {
		this._index = index;
		if (geometry) {
			this._geometry = geometry;
		}
		return this;
	}
	geometry() {
		return this._geometry;
	}
	builder<T extends CoreObjectType>(): ObjectBuilder<T> | undefined {
		return undefined;
	}

	attribSize(attribName: string): number {
		attribName = CoreAttribute.remapName(attribName);
		return this._geometry?.getAttribute(attribName).itemSize || 0;
	}

	hasAttrib(attribName: string): boolean {
		const remappedName = CoreAttribute.remapName(attribName);
		return this._geometry ? CoreGeometry.hasAttrib(this._geometry, remappedName) : false;
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
			let componentName = null;
			let componentIndex = null;
			if (attribName[attribName.length - 2] === DOT) {
				componentName = attribName[attribName.length - 1] as ComponentName;
				componentIndex = COMPONENT_INDICES[componentName];
				attribName = attribName.substring(0, attribName.length - 2);
			}
			const remapedName = CoreAttribute.remapName(attribName);

			const attrib = geometry.getAttribute(remapedName) as BufferAttribute | undefined;
			if (attrib) {
				const {array} = attrib;
				if (CoreGeometry.isAttribIndexed(geometry, remapedName)) {
					return CorePoint.indexedAttribValue(geometry, index, remapedName);
				} else {
					const itemSize = attrib.itemSize;
					const startIndex = index * itemSize;

					if (componentIndex == null) {
						switch (itemSize) {
							case 1:
								return array[startIndex];
								break;
							case 2:
								target = target || new Vector2();
								target.fromArray(array, startIndex);
								return target;
								break;
							case 3:
								target = target || new Vector3();
								target.fromArray(array, startIndex);
								return target;
								break;
							case 4:
								target = target || new Vector4();
								target.fromArray(array, startIndex);
								return target;
								break;
							default:
								throw `size not valid (${itemSize})`;
						}
					} else {
						switch (itemSize) {
							case 1:
								return array[startIndex];
								break;
							default:
								return array[startIndex + componentIndex];
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
		return this._geometry ? CorePoint.attribValue(this._geometry, this._index, attribName, target) : 0;
	}
	attribValueNumber(attribName: string) {
		const remapedName = CoreAttribute.remapName(attribName);
		if (!this._geometry) {
			return 0;
		}
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		return attrib.array[this._index];
	}
	attribValueVector2(attribName: string, target: Vector2) {
		const remapedName = CoreAttribute.remapName(attribName);
		if (!this._geometry) {
			return;
		}
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		target.fromArray(attrib.array, this._index * 2);
		return target;
	}
	attribValueVector3(attribName: string, target: Vector3) {
		const remapedName = CoreAttribute.remapName(attribName);
		if (!this._geometry) {
			return;
		}
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		target.fromArray(attrib.array, this._index * 3);
		return target;
	}
	attribValueVector4(attribName: string, target: Vector4) {
		const remapedName = CoreAttribute.remapName(attribName);
		if (!this._geometry) {
			return;
		}
		const attrib = this._geometry.getAttribute(remapedName) as BufferAttribute;
		target.fromArray(attrib.array, this._index * 4);
		return target;
	}
	static indexedAttribValue(geometry: BufferGeometry, index: number, attribName: string): string {
		const valueIndex = this.attribValueIndex(geometry, index, attribName); //attrib.value()
		return CoreGeometry.userDataAttrib(geometry, attribName)[valueIndex];
	}
	indexedAttribValue(attribName: string): string {
		const valueIndex = this.attribValueIndex(attribName); //attrib.value()
		if (!this._geometry) {
			return '';
		}
		return CoreGeometry.userDataAttrib(this._geometry, attribName)[valueIndex];
	}
	static stringAttribValue(geometry: BufferGeometry, index: number, attribName: string) {
		return this.indexedAttribValue(geometry, index, attribName);
	}
	stringAttribValue(attribName: string) {
		return this.indexedAttribValue(attribName);
	}
	static attribValueIndex(geometry: BufferGeometry, index: number, attribName: string): number {
		if (CoreGeometry.isAttribIndexed(geometry, attribName)) {
			return (geometry.getAttribute(attribName) as BufferAttribute).array[index];
		} else {
			return -1;
		}
	}
	attribValueIndex(attribName: string): number {
		if (!this._geometry) {
			return -1;
		}
		return CorePoint.attribValueIndex(this._geometry, this._index, attribName);
		// if (this._coreGeometry.isAttribIndexed(name)) {
		// 	return this._geometry.getAttribute(name).array[this._index];
		// } else {
		// 	return -1;
		// }
	}
	isAttribIndexed(attribName: string): boolean {
		if (!this._geometry) {
			return false;
		}
		return CoreGeometry.isAttribIndexed(this._geometry, attribName);
	}

	position(target: Vector3) {
		if (!this._geometry) {
			return target;
		}
		const {array} = this._geometry.getAttribute(Attribute.POSITION) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	setPosition(newPosition: Vector3) {
		this.setAttribValueFromVector3(Attribute.POSITION, newPosition);
	}

	normal(target: Vector3): Vector3 {
		if (!this._geometry) {
			return target;
		}
		const {array} = this._geometry.getAttribute(Attribute.NORMAL) as BufferAttribute;
		return target.fromArray(array, this._index * 3);
	}
	setNormal(newNormal: Vector3) {
		return this.setAttribValueFromVector3(Attribute.NORMAL, newNormal);
	}

	setAttribValue(attribName: string, value: NumericAttribValue | string) {
		if (!this._geometry) {
			return;
		}
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		const array = attrib.array as number[];
		const attribSize = attrib.itemSize;

		if (isArray(value)) {
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
		if (!this._geometry) {
			return;
		}
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		const array = attrib.array as number[];
		array[this._index] = value;
	}
	setAttribValueFromVector2(attribName: string, value: Vector2) {
		if (!this._geometry) {
			return;
		}
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		value.toArray(attrib.array, this._index * 2);
	}
	setAttribValueFromVector3(attribName: string, value: Vector3) {
		if (!this._geometry) {
			return;
		}
		const attrib = this._geometry.getAttribute(attribName) as BufferAttribute;
		value.toArray(attrib.array, this._index * 3);
	}
	setAttribValueFromVector4(attribName: string, value: Vector4) {
		if (!this._geometry) {
			return;
		}
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

	setAttribIndex(attribName: string, newValueIndex: number) {
		if (!this._geometry) {
			return;
		}
		const array = (this._geometry.getAttribute(attribName) as BufferAttribute).array as number[];
		return (array[this._index] = newValueIndex);
	}
}
