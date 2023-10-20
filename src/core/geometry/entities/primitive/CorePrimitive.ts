import {
	AttribValue,
	ColorLike,
	NumericAttribValue,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../../../types/GlobalTypes';
import {Vector4, Vector3, Vector2} from 'three';
import {Attribute, CoreAttribute} from '../../Attribute';
import {CoreEntity} from '../../CoreEntity';
import {CoreType} from '../../../Type';
import {BasePrimitiveAttribute} from './PrimitiveAttribute';
import {DOT, ComponentName, COMPONENT_INDICES, GroupString, AttribClass, AttribSize, AttribType} from '../../Constant';
import {PrimitiveAttributesDict} from './Common';
import {CoreObjectType, ObjectContent, ObjectBuilder} from '../../ObjectContent';
import {BaseCoreObject} from '../object/BaseCoreObject';
import {TypeAssert} from '../../../../engine/poly/Assert';
import {coreObjectInstanceFactory} from '../../CoreObjectFactory';
import {uniqRelatedEntities} from '../utils/Common';
import type {CoreVertex} from '../vertex/CoreVertex';
import type {CoreGroup} from '../../Group';
import {arrayCopy} from '../../../ArrayUtils';
import type {PrimitiveGraph} from './PrimitiveGraph';

function _warnOverloadRequired(functionName: string) {
	console.warn(`CorePrimitive.${functionName} needs to be overloaded`);
}
export abstract class CorePrimitive<T extends CoreObjectType> extends CoreEntity {
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
	static entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>) {
		return 0;
	}

	static addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BasePrimitiveAttribute
	) {
		_warnOverloadRequired('addAttribute');
	}
	static addNumericAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		size: AttribSize = 1,
		defaultValue: NumericAttribValue = 0
	) {
		_warnOverloadRequired('addNumericAttribute');
	}

	static attributes<T extends CoreObjectType>(object?: ObjectContent<T>): PrimitiveAttributesDict | undefined {
		_warnOverloadRequired('attributes');
		return;
	}
	attributes(): PrimitiveAttributesDict | undefined {
		if (!this._object) {
			return;
		}
		return (this.constructor as typeof CorePrimitive<T>).attributes(this._object);
	}
	static attribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string
	): BasePrimitiveAttribute | undefined {
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		return attributes[attribName];
	}
	attribute(attribName: string): BasePrimitiveAttribute | undefined {
		if (!this._object) {
			return;
		}
		return (this.constructor as typeof CorePrimitive<T>).attribute(this._object, attribName);
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
		return (this.constructor as typeof CorePrimitive<T>).attribSize(this._object, attribName);
	}
	static hasAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): boolean {
		const remappedName = CoreAttribute.remapName(attribName);
		return this.attributes(object) ? this.attributes(object)![remappedName] != null : false;
	}
	hasAttribute(attribName: string): boolean {
		if (!this._object) {
			return false;
		}
		return (this.constructor as typeof CorePrimitive<T>).hasAttribute(this._object, attribName);
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
		if (attribName === Attribute.PRIMITIVE_INDEX) {
			return index;
		}
			let componentName = null;
			let componentIndex = null;
			if (attribName[attribName.length - 2] === DOT) {
				componentName = attribName[attribName.length - 1] as ComponentName;
				componentIndex = COMPONENT_INDICES[componentName];
				attribName = attribName.substring(0, attribName.length - 2);
			}
			const remapedName = CoreAttribute.remapName(attribName);

			if(remapedName==Attribute.POSITION){
				return this.position(object as any, index, target as Vector3);
			}
			if(remapedName==Attribute.NORMAL){
				return this.normal(object as any, index, target as Vector3);
			}

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
				const attributesDict = this.attributes(object) || {};
				const attribNames: string[] = Object.keys(attributesDict);
				const message = `attrib ${attribName} not found. availables are: ${attribNames.join(',')}`;
				console.warn(message);
				throw message;
			}
	}
	attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue {
		if (!this._object) {
			return 0;
		}
		return (this.constructor as typeof CorePrimitive<T>).attribValue(this._object, this._index, attribName, target);
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
	static attribType<T extends CoreObjectType>(object: ObjectContent<T> | undefined, attribName: string): AttribType {
		const attribute = object ? this.attribute(object, attribName) : null;
		if (attribute && attribute?.isString == true) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}
	attribType(attribName: string): AttribType {
		return (this.constructor as typeof CorePrimitive).attribType(this._object, attribName);
	}
	static stringAttribValue<T extends CoreObjectType>(object: ObjectContent<T>, index: number, attribName: string) {
		return this.attribValue(object, index, attribName);
	}
	stringAttribValue(attribName: string) {
		return this.attribValue(attribName) as string;
	}

	// setPosition(newPosition: Vector3) {
	// 	this.setAttribValueFromVector3(Attribute.POSITION, newPosition);
	// }

	// setNormal(newNormal: Vector3) {
	// 	return this.setAttribValueFromVector3(Attribute.NORMAL, newNormal);
	// }
	static position<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		_warnOverloadRequired('position');
		return target;
	}
	static normal<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		primitiveIndex: number,
		target: Vector3
	): Vector3 {
		_warnOverloadRequired('normal');
		return target;
	}

	static computeVertexNormalsIfAttributeVersionChanged<T extends CoreObjectType>(object: ObjectContent<T>) {
		_warnOverloadRequired('computeVertexNormalsIfAttributeVersionChanged');
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
				console.warn(`CorePrimitive.setAttribValue does not yet allow attribSize ${attribSize}`);
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
	relatedObjects(): BaseCoreObject<CoreObjectType>[] {
		return this._object ? [coreObjectInstanceFactory(this._object)] : [];
	}
	relatedVertices(): CoreVertex<CoreObjectType>[] {
		return [];
	}
	relatedPoints() {
		return uniqRelatedEntities(this.relatedVertices(), (vertex) => vertex.relatedPoints());
	}
	relatedEntities(attribClass: AttribClass, coreGroup: CoreGroup, target: CoreEntity[]): void {
		switch (attribClass) {
			case AttribClass.POINT: {
				return arrayCopy(this.relatedPoints(), target);
			}
			case AttribClass.VERTEX: {
				return arrayCopy(this.relatedVertices(), target);
			}
			case AttribClass.PRIMITIVE: {
				target.length = 1;
				target[0] = this;
				return;
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
	static graph(object: ObjectContent<CoreObjectType>): PrimitiveGraph | undefined {
		console.warn('CorePrimitive.graph needs to be overriden');
		return undefined;
	}
}
