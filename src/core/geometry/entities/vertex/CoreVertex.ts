import {
	AttribValue,
	ColorLike,
	NumericAttribValue,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../../../types/GlobalTypes';
import {Vector4, Vector3, Vector2, BufferAttribute} from 'three';
import {Attribute, CoreAttribute} from '../../Attribute';
import {CoreEntity} from '../../CoreEntity';
import {CoreType} from '../../../Type';
import {BaseVertexAttribute} from './VertexAttribute';
import {DOT, ComponentName, COMPONENT_INDICES, GroupString, AttribClass} from '../../Constant';
import {VertexAttributesDict} from './Common';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../ObjectContent';
import type {TypedCorePoint} from '../point/CorePoint';
import type {CorePrimitive} from '../primitive/CorePrimitive';
import {uniqRelatedEntities} from '../utils/Common';
import {TypeAssert} from '../../../../engine/poly/Assert';
import {CoreGroup} from '../../Group';
import {arrayCopy} from '../../../ArrayUtils';

export abstract class CoreVertex<T extends CoreObjectType> extends CoreEntity {
	protected _object?: ObjectContent<T>;
	constructor(object?: ObjectContent<T>, index?: number) {
		super(object, index);
		this._object = object;
	}
	object() {
		return this._object;
	}
	builder<T extends CoreObjectType>(): ObjectBuilder<T> | undefined {
		return undefined;
	}

	static addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BaseVertexAttribute
	) {
		console.warn('CoreVertex.addAttribute needs to be overloaded');
	}

	static verticesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}

	static attributes<T extends CoreObjectType>(object?: ObjectContent<T>): VertexAttributesDict | undefined {
		console.warn('CoreVertex.attributes needs to be overloaded');
		return;
	}
	attributes(): VertexAttributesDict | undefined {
		if (!this._object) {
			return;
		}
		return (this.constructor as typeof CoreVertex<T>).attributes(this._object);
	}
	static attribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string
	): BaseVertexAttribute | undefined {
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		return attributes[attribName];
	}
	attribute(attribName: string): BaseVertexAttribute | undefined {
		if (!this._object) {
			return;
		}
		return (this.constructor as typeof CoreVertex<T>).attribute(this._object, attribName);
	}
	static indexAttribute<T extends CoreObjectType>(object: ObjectContent<T>): BufferAttribute | undefined | null {
		console.warn('CoreVertex.indexAttribute needs to be overloaded');
		return;
	}
	static setIndexAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: BufferAttribute | number[]
	): BufferAttribute | undefined {
		console.warn('CoreVertex.setIndexAttribute needs to be overloaded');
		return;
	}
	static renameAttribute<T extends CoreObjectType>(object: ObjectContent<T>, oldName: string, newName: string) {
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		const attribute = this.attribute(object, oldName);
		if (!attribute) {
			return;
		}
		attributes[newName] = attribute;
		delete attributes[oldName];
	}
	static deleteAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		delete attributes[attribName];
	}
	static attribSize<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): number {
		const attributes = this.attributes(object);
		if (!attributes) {
			return -1;
		}
		attribName = CoreAttribute.remapName(attribName);
		return attributes[attribName].itemSize || 0;
	}

	attribSize(attribName: string): number {
		if (!this._object) {
			return 0;
		}
		return (this.constructor as typeof CoreVertex<T>).attribSize(this._object, attribName);
	}
	static hasAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): boolean {
		return this.attribute(object, attribName) != null;
	}
	hasAttribute(attribName: string): boolean {
		if (!this._object) {
			return false;
		}
		return (this.constructor as typeof CoreVertex<T>).hasAttribute(this._object, attribName);
	}
	static attributeNames<T extends CoreObjectType>(object?: ObjectContent<T>): string[] {
		const attributes = this.attributes(object);
		if (!attributes) {
			return [];
		}
		return Object.keys(attributes);
	}
	static attributeNamesMatchingMask<T extends CoreObjectType>(object: ObjectContent<T>, masksString: GroupString) {
		return CoreAttribute.attribNamesMatchingMask(masksString, this.attributeNames(object));
	}
	static attribValue<T extends CoreObjectType>(
		object: ObjectContent<T>,
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

			const attrib = this.attribute(object, remapedName);
			if (attrib) {
				const {array} = attrib;

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
				const attributesDict = this.attributes() || {};
				const attribNames: string[] = Object.keys(attributesDict);
				const message = `attrib ${attribName} not found. availables are: ${attribNames.join(',')}`;
				console.warn(message);
				throw message;
			}
		}
	}
	attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue {
		if (!this._object) {
			return 0;
		}
		return (this.constructor as typeof CoreVertex<T>).attribValue(this._object, this._index, attribName, target);
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

	static stringAttribValue<T extends CoreObjectType>(object: ObjectContent<T>, index: number, attribName: string) {
		return this.attribValue(object, index, attribName);
	}
	stringAttribValue(attribName: string) {
		return this.attribValue(attribName) as string;
	}

	position(target: Vector3) {
		console.warn('CoreVertex.position needs to be overloaded');
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
				console.warn(`CoreVertex.setAttribValue does not yet allow attrib size ${attribSize}`);
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
		if (!attrib || attrib.isString == true) {
			return;
		}

		value.toArray(attrib.array as number[], this._index * 2);
	}
	setAttribValueFromVector3(attribName: string, value: Vector3) {
		const attrib = this.attribute(attribName);
		if (!attrib || attrib.isString == true) {
			return;
		}
		value.toArray(attrib.array as number[], this._index * 3);
	}
	setAttribValueFromVector4(attribName: string, value: Vector4) {
		const attrib = this.attribute(attribName);
		if (!attrib || attrib.isString == true) {
			return;
		}
		value.toArray(attrib.array as number[], this._index * 4);
	}

	//
	//
	// RELATED ENTITIES
	//
	//
	relatedObjects() {
		return uniqRelatedEntities(this.relatedPrimitives(), (primitive) => primitive.relatedObjects());
	}
	relatedPrimitives<T extends CoreObjectType>(): CorePrimitive<T>[] {
		return [];
	}
	relatedPoints<T extends CoreObjectType>(): TypedCorePoint<T>[] {
		return [];
	}
	relatedEntities(attribClass: AttribClass, coreGroup: CoreGroup, target: CoreEntity[]): void {
		switch (attribClass) {
			case AttribClass.POINT: {
				return arrayCopy(this.relatedPoints(), target);
			}
			case AttribClass.VERTEX: {
				target.length = 1;
				target[0] = this;
				return;
			}
			case AttribClass.PRIMITIVE: {
				return arrayCopy(this.relatedPrimitives(), target);
			}
			case AttribClass.OBJECT: {
				return arrayCopy(this.relatedObjects(), target);
			}
			case AttribClass.CORE_GROUP: {
				target.length = 1;
				target[0] = coreGroup;
				return;
			}
		}
		TypeAssert.unreachable(attribClass);
	}
}
