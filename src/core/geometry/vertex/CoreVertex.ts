import {
	AttribValue,
	ColorLike,
	NumericAttribValue,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../../types/GlobalTypes';
import {Vector4, Vector3, Vector2} from 'three';
import {Attribute, CoreAttribute} from '../Attribute';
import {CoreEntity} from '../Entity';
import {CoreType} from '../../Type';
import {BaseVertexAttribute} from './VertexAttribute';
import {DOT, ComponentName, COMPONENT_INDICES} from '../Constant';
import {VertexAttributesDict} from './Common';
import {CoreObjectType, ObjectContent} from '../ObjectContent';

// const _coreFace = new CoreFace();
// const _triangle = new Triangle();

export interface GeometryWithVertexAttributes {
	userData: {
		vertexAttributes?: VertexAttributesDict;
	};
}

export class CoreVertex<T extends CoreObjectType> extends CoreEntity {
	protected _object?: ObjectContent<T>;
	protected _geometry?: GeometryWithVertexAttributes;
	constructor(object?: ObjectContent<T>, index?: number) {
		super(object?.geometry, index);
		this._object = object;
	}
	setGeometry(geometry: GeometryWithVertexAttributes) {
		this._geometry = geometry;
		return this;
	}
	override setIndex(index: number, geometry?: GeometryWithVertexAttributes) {
		this._index = index;
		if (geometry) {
			this._geometry = geometry;
		}
		return this;
	}
	geometry() {
		return this._geometry;
	}
	static addAttribute(geometry: GeometryWithVertexAttributes, attribName: string, attribute: BaseVertexAttribute) {
		if (!geometry.userData.vertexAttributes) {
			geometry.userData.vertexAttributes = {};
		}
		geometry.userData.vertexAttributes[attribName] = attribute;
	}

	static verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}

	static attributes(geometry: GeometryWithVertexAttributes): VertexAttributesDict | undefined {
		return geometry.userData.vertexAttributes;
	}
	attributes(): VertexAttributesDict | undefined {
		if (!this._geometry) {
			return;
		}
		return (this.constructor as typeof CoreVertex<T>).attributes(this._geometry);
	}
	static attribute(geometry: GeometryWithVertexAttributes, attribName: string): BaseVertexAttribute | undefined {
		const attributes = this.attributes(geometry);
		if (!attributes) {
			return;
		}
		return attributes[attribName];
	}
	attribute(attribName: string): BaseVertexAttribute | undefined {
		return (this.constructor as typeof CoreVertex<T>).attribute(
			this._geometry as GeometryWithVertexAttributes,
			attribName
		);
	}
	static attribSize(geometry: GeometryWithVertexAttributes, attribName: string): number {
		const attributes = this.attributes(geometry);
		if (!attributes) {
			return -1;
		}
		attribName = CoreAttribute.remapName(attribName);
		return attributes[attribName].itemSize || 0;
	}

	attribSize(attribName: string): number {
		return (this.constructor as typeof CoreVertex<T>).attribSize(
			this._geometry as GeometryWithVertexAttributes,
			attribName
		);
	}
	static hasAttrib(geometry: GeometryWithVertexAttributes, attribName: string): boolean {
		const remappedName = CoreAttribute.remapName(attribName);
		return this.attributes(geometry) ? this.attributes(geometry)![remappedName] != null : false;
	}

	hasAttrib(attribName: string): boolean {
		return (this.constructor as typeof CoreVertex<T>).hasAttrib(
			this._geometry as GeometryWithVertexAttributes,
			attribName
		);
	}
	static attribValue(
		geometry: GeometryWithVertexAttributes,
		index: number,
		attribName: string,
		target?: Vector2 | Vector3 | Vector4
	): AttribValue {
		if (attribName === Attribute.VERTEX_INDEX) {
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

			const attrib = this.attribute(geometry, remapedName);
			if (attrib) {
				const {array} = attrib;
				// if (attrib.isString()) {
				// 	return CorePrimitive.indexedAttribValue(geometry, index, remapedName);
				// } else {
				const itemSize = attrib.itemSize;
				const startIndex = index * itemSize;

				if (componentIndex == null) {
					switch (itemSize) {
						case 1:
							return array[startIndex];
							break;
						case 2:
							target = target || new Vector2();
							target.fromArray(array as number[], startIndex);
							return target;
							break;
						case 3:
							target = target || new Vector3();
							target.fromArray(array as number[], startIndex);
							return target;
							break;
						case 4:
							target = target || new Vector4();
							target.fromArray(array as number[], startIndex);
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
				// }
			} else {
				const attributes = this.attributes(geometry);
				const attributeNames = attributes ? Object.keys(attributes) : [];
				const message = `attrib ${attribName} not found. availables are: ${attributeNames.join(',')}`;
				console.warn(message);
				throw message;
			}
		}
	}
	attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue {
		return this._geometry
			? (this.constructor as typeof CoreVertex<T>).attribValue(this._geometry, this._index, attribName, target)
			: 0;
	}
	attribValueNumber(attribName: string) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return 0;
		}
		return attrib.array[this._index];
	}
	attribValueVector2(attribName: string, target: Vector2) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		target.fromArray(attrib.array as number[], this._index * 2);
		return target;
	}
	attribValueVector3(attribName: string, target: Vector3) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		target.fromArray(attrib.array as number[], this._index * 3);
		return target;
	}
	attribValueVector4(attribName: string, target: Vector4) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		target.fromArray(attrib.array as number[], this._index * 4);
		return target;
	}

	static stringAttribValue(geometry: GeometryWithVertexAttributes, index: number, attribName: string) {
		return this.attribValue(geometry, index, attribName); //this.indexedAttribValue(geometry, index, attribName);
	}
	stringAttribValue(attribName: string) {
		return this.attribValue(attribName) as string; //this.indexedAttribValue(attribName);
	}

	position(target: Vector3) {
		console.warn('CoreVertex.position needs to be overloadedd');
	}
	setPosition(newPosition: Vector3) {
		this.setAttribValueFromVector3(Attribute.POSITION, newPosition);
	}

	normal(target: Vector3): Vector3 {
		console.warn('CoreVertex.normal needs to be overloadedd');
		return target;
	}
	setNormal(newNormal: Vector3) {
		return this.setAttribValueFromVector3(Attribute.NORMAL, newNormal);
	}

	setAttribValue(attribName: string, value: NumericAttribValue | string) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			console.warn(`no attribute ${attribName}`);
			return;
		}
		const array = attrib.array;
		const attribSize = attrib.itemSize;

		if (CoreType.isArray(value)) {
			for (let i = 0; i < attribSize; i++) {
				array[this._index * attribSize + i] = value[i];
			}
			return;
		}

		switch (attribSize) {
			case 1:
				array[this._index] = value as number | string;
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
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		const array = attrib.array as number[];
		array[this._index] = value;
	}
	setAttribValueFromVector2(attribName: string, value: Vector2) {
		const attrib = this.attribute(attribName);
		if (!attrib || attrib.isString()) {
			return;
		}

		value.toArray(attrib.array as number[], this._index * 2);
	}
	setAttribValueFromVector3(attribName: string, value: Vector3) {
		const attrib = this.attribute(attribName);
		if (!attrib || attrib.isString()) {
			return;
		}
		value.toArray(attrib.array as number[], this._index * 3);
	}
	setAttribValueFromVector4(attribName: string, value: Vector4) {
		const attrib = this.attribute(attribName);
		if (!attrib || attrib.isString()) {
			return;
		}
		value.toArray(attrib.array as number[], this._index * 4);
	}
}
