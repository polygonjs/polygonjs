import {
	AttribValue,
	ColorLike,
	NumericAttribValue,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../../../types/GlobalTypes';
import {BufferAttribute, Vector4, Vector3, Vector2, InterleavedBufferAttribute} from 'three';
import {Attribute, CoreAttribute} from '../../Attribute';
import {isArray} from '../../../Type';
import {CoreEntity, CoreEntityWithObject} from '../../CoreEntity';
import {
	DOT,
	ComponentName,
	COMPONENT_INDICES,
	AttribType,
	GroupString,
	AttribClass,
	AttribSize,
	ComponentIndex,
} from '../../Constant';
import {ObjectContent, CoreObjectType, ObjectBuilder} from '../../ObjectContent';
import {PointAttributesDict} from './Common';
import {CoreAttributeData} from '../../AttributeData';
import {coreObjectInstanceFactory} from '../../CoreObjectFactory';
import {TypeAssert} from '../../../../engine/poly/Assert';
import {uniqRelatedEntityIds} from '../utils/Common';
import type {CoreGroup} from '../../Group';
import {TraversedRelatedEntityData} from '../utils/TraversedRelatedEntities';

const _relatedPrimitiveIds: number[] = [];

function _warnOverloadRequired(functionName: string) {
	console.warn(`CorePoint.${functionName} needs to be overloaded`);
}
export abstract class CorePoint<T extends CoreObjectType> extends CoreEntityWithObject<T> {
	// protected _object?: ObjectContent<T>;
	// constructor(object?: ObjectContent<T>, index?: number) {
	// 	super(object, index);
	// 	this._object = object;
	// }

	builder<T extends CoreObjectType>(): ObjectBuilder<T> | undefined {
		return undefined;
	}
	static addAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribute: BufferAttribute
	) {
		_warnOverloadRequired('addAttribute');
	}

	static entitiesCount<T extends CoreObjectType>(object: ObjectContent<T>): number {
		return 0;
	}

	static attributes<T extends CoreObjectType>(object?: ObjectContent<T>): PointAttributesDict | undefined {
		_warnOverloadRequired('attributes');
		return;
	}
	attributes(): PointAttributesDict | undefined {
		// if (!this._object) {
		// 	return;
		// }
		return (this.constructor as typeof CorePoint<T>).attributes(this._object);
	}
	static attribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string
	): BufferAttribute | InterleavedBufferAttribute | undefined {
		const attributes = this.attributes(object);
		if (!attributes) {
			return;
		}
		return attributes[attribName];
	}
	attribute(attribName: string): BufferAttribute | InterleavedBufferAttribute | undefined {
		// if (!this._object) {
		// 	return;
		// }
		return (this.constructor as typeof CorePoint<T>).attribute(this._object, attribName);
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
		// if (!this._object) {
		// 	return 0;
		// }
		return (this.constructor as typeof CorePoint<T>).attribSize(this._object, attribName);
	}
	static hasAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): boolean {
		const remappedName = CoreAttribute.remapName(attribName);
		return this.attributes(object) ? this.attributes(object)![remappedName] != null : false;
	}

	hasAttribute(attribName: string): boolean {
		// if (!this._object) {
		// 	return false;
		// }
		return (this.constructor as typeof CorePoint<T>).hasAttribute(this._object, attribName);
	}

	//
	//
	// INDEXED ATTRIBUTES
	//
	//
	static userDataAttribs<T extends CoreObjectType>(object?: ObjectContent<T>): Record<string, string[]> {
		_warnOverloadRequired('userDataAttribs');
		return {};
	}
	userDataAttribs(): Record<string, string[]> {
		return this._object ? (this.constructor as typeof CorePoint).userDataAttribs(this._object) : {};
	}
	static userDataAttrib<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		attribName: string
	): string[] | undefined {
		attribName = CoreAttribute.remapName(attribName);
		return this.userDataAttribs(object)[attribName];
	}
	userDataAttrib(name: string) {
		name = CoreAttribute.remapName(name);
		return this.userDataAttribs()[name];
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
	static indexedAttributeNames<T extends CoreObjectType>(object?: ObjectContent<T>): string[] {
		return object ? Object.keys(this.userDataAttribs(object) || {}) : [];
	}
	indexedAttributeNames(): string[] {
		return this._object ? (this.constructor as typeof CorePoint).indexedAttributeNames(this._object) : [];
		// return Object.keys(this.userDataAttribs() || {});
	}
	static isAttribIndexed<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		attribName: string
	): boolean {
		attribName = CoreAttribute.remapName(attribName);
		return this.userDataAttrib(object, attribName) != null;
	}
	isAttribIndexed(name: string): boolean {
		name = CoreAttribute.remapName(name);
		return this.userDataAttrib(name) != null;
	}
	static setIndexedAttributeValues<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		attribName: string,
		values: string[]
	) {
		this.userDataAttribs(object)[attribName] = values;
	}
	setIndexedAttributeValues(attribName: string, values: string[]) {
		return (this.constructor as typeof CorePoint).setIndexedAttributeValues(this._object, attribName, values);
	}
	static setIndexedAttribute<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		attribName: string,
		values: string[],
		indices: number[]
	) {
		_warnOverloadRequired('setIndexedAttribute');
	}
	setIndexedAttribute(attribName: string, values: string[], indices: number[]) {
		return (this.constructor as typeof CorePoint).setIndexedAttribute(this._object, attribName, values, indices);
	}
	//
	static indexedAttribValue<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		index: number,
		attribName: string
	): string | null {
		const valueIndex = this.attribValueIndex(object, index, attribName); //attrib.value()
		const values = this.userDataAttrib(object, attribName);
		return values ? values[valueIndex] : null;
	}
	indexedAttribValue(attribName: string): string | null {
		return (this.constructor as typeof CorePoint).indexedAttribValue(this._object, this._index, attribName);
	}
	static stringAttribValue<T extends CoreObjectType>(object: ObjectContent<T>, index: number, attribName: string) {
		return this.indexedAttribValue(object, index, attribName);
	}
	stringAttribValue(attribName: string) {
		return this.indexedAttribValue(attribName);
	}
	static attribValueIndex<T extends CoreObjectType>(
		object: ObjectContent<T> | undefined,
		index: number,
		attribName: string
	): number {
		_warnOverloadRequired('attribValueIndex');
		return 0;
	}
	attribValueIndex(attribName: string): number {
		return (this.constructor as typeof CorePoint).attribValueIndex(this._object, this._index, attribName);
	}
	static attribType<T extends CoreObjectType>(object: ObjectContent<T> | undefined, attribName: string): AttribType {
		if (this.isAttribIndexed(object, attribName)) {
			return AttribType.STRING;
		} else {
			return AttribType.NUMERIC;
		}
	}
	attribType(attribName: string): AttribType {
		return (this.constructor as typeof CorePoint).attribType(this._object, attribName);
	}
	isStringAttribute(attribName: string): boolean {
		return this.attribType(attribName) == AttribType.STRING;
	}
	setAttribIndex(attribName: string, newValueIndex: number) {
		// if (!this._geometry) {
		// 	return;
		// }
		const attribute = this.attribute(attribName);
		if (!attribute) {
			return;
		}
		const array = (attribute as BufferAttribute).array;
		return (array[this._index] = newValueIndex);
	}

	//
	//
	//
	//
	//
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

	//
	//
	//
	//
	//

	static attribValue<T extends CoreObjectType>(
		object: ObjectContent<T>,
		index: number,
		attribName: string,
		target?: Vector2 | Vector3 | Vector4
	): AttribValue {
		if (attribName === Attribute.POINT_INDEX) {
			return index;
		} else {
			let componentName: ComponentName | null = null;
			let componentIndex: ComponentIndex | null = null;
			if (attribName[attribName.length - 2] === DOT) {
				componentName = attribName[attribName.length - 1] as ComponentName;
				componentIndex = COMPONENT_INDICES[componentName];
				attribName = attribName.substring(0, attribName.length - 2);
			}
			const remapedName = CoreAttribute.remapName(attribName);

			const attrib = this.attribute(object, remapedName);
			if (attrib) {
				const {array} = attrib;
				if (this.isAttribIndexed(object, remapedName)) {
					return this.indexedAttribValue(object, index, remapedName)!;
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
				const attributesDict = this.attributes() || {};
				const attribNames: string[] = Object.keys(attributesDict);
				const message = `attrib ${attribName} not found. availables are: ${attribNames.join(',')}`;
				console.warn(message);
				throw message;
			}
		}
	}
	attribValue(attribName: string, target?: Vector2 | Vector3 | Vector4): AttribValue {
		// if (!this._object) {
		// 	return 0;
		// }
		return (this.constructor as typeof CorePoint<T>).attribValue(this._object, this._index, attribName, target);
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
		target.fromArray(attrib.array, this._index * 2);
		return target;
	}
	attribValueVector3(attribName: string, target: Vector3) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		target.fromArray(attrib.array, this._index * 3);
		return target;
	}
	attribValueVector4(attribName: string, target: Vector4) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		target.fromArray(attrib.array, this._index * 4);
		return target;
	}

	position(target: Vector3): Vector3 {
		_warnOverloadRequired('position');
		return target;
	}
	setPosition(newPosition: Vector3) {
		this.setAttribValueFromVector3(Attribute.POSITION, newPosition);
	}

	normal(target: Vector3): Vector3 {
		_warnOverloadRequired('normal');
		return target;
	}
	setNormal(newNormal: Vector3) {
		return this.setAttribValueFromVector3(Attribute.NORMAL, newNormal);
	}
	static computeNormals<T extends CoreObjectType>(object: ObjectContent<T>) {
		_warnOverloadRequired('computeNormals');
	}

	setAttribValue(attribName: string, value: NumericAttribValue | string) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		const array = attrib.array;
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
				console.warn(`CorePoint.setAttribValue does not yet allow attrib size ${attribSize}`);
				throw `attrib size ${attribSize} not implemented`;
		}
	}
	setAttribValueFromNumber(attribName: string, value: number) {
		const attrib = this.attribute(attribName);
		if (!attrib) {
			return;
		}
		const array = attrib.array;
		array[this._index] = value;
	}
	setAttribValueFromVector2(attribName: string, value: Vector2) {
		const attrib = this.attribute(attribName);
		if (!attrib || this.isStringAttribute(attribName)) {
			return;
		}

		value.toArray(attrib.array, this._index * 2);
	}
	setAttribValueFromVector3(attribName: string, value: Vector3) {
		const attrib = this.attribute(attribName);
		if (!attrib || this.isStringAttribute(attribName)) {
			return;
		}
		value.toArray(attrib.array, this._index * 3);
	}
	setAttribValueFromVector4(attribName: string, value: Vector4) {
		const attrib = this.attribute(attribName);
		if (!attrib || this.isStringAttribute(attribName)) {
			return;
		}
		value.toArray(attrib.array, this._index * 4);
	}

	//
	static addAttributeFromAttribData<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		attribData: CoreAttributeData
	) {
		switch (attribData.type()) {
			case AttribType.STRING:
				return console.log('TODO: to implement');
			case AttribType.NUMERIC:
				return this.addNumericAttribute(object, attribName, attribData.size());
		}
	}
	static addNumericAttribute<T extends CoreObjectType>(
		object: ObjectContent<T>,
		attribName: string,
		size: AttribSize = 1,
		defaultValue: NumericAttribValue = 0
	) {
		_warnOverloadRequired('addNumericAttribute');
	}
	//
	static markAttribAsNeedsUpdate<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string) {
		_warnOverloadRequired('markAttribAsNeedsUpdate');
	}

	//
	//
	// RELATED ENTITIES
	//
	//
	static override relatedPrimitiveIds<T extends CoreObjectType>(
		object: ObjectContent<T>,
		pointIndex: number,
		target: number[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		const ids = traversedRelatedEntityData
			? traversedRelatedEntityData[AttribClass.VERTEX].ids
			: _relatedPrimitiveIds;
		this.relatedVertexIds(object, pointIndex, ids);
		uniqRelatedEntityIds(
			ids,
			(vertexId, relatedEntityIds) => {
				this.relatedVertexClass(object).relatedPrimitiveIds(object, vertexId, relatedEntityIds);
			},
			target
		);
	}
	static override relatedPrimitiveClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return this.relatedVertexClass(object).relatedPrimitiveClass(object);
	}
	static override relatedObjectClass<T extends CoreObjectType>(object: ObjectContent<T>) {
		return this.relatedPrimitiveClass(object).relatedObjectClass(object);
	}

	relatedEntities(
		attribClass: AttribClass,
		coreGroup: CoreGroup,
		target: CoreEntity[],
		traversedRelatedEntityData?: TraversedRelatedEntityData
	): void {
		switch (attribClass) {
			case AttribClass.POINT: {
				target.length = 1;
				target[0] = this;
				return;
			}
			case AttribClass.VERTEX: {
				return this.relatedVertices(target as CoreEntityWithObject<T>[], traversedRelatedEntityData);
			}
			case AttribClass.PRIMITIVE: {
				return this.relatedPrimitives(target as CoreEntityWithObject<T>[], traversedRelatedEntityData);
			}
			case AttribClass.OBJECT: {
				if (this._object) {
					target.length = 1;
					target[0] = coreObjectInstanceFactory(this._object) as any as CoreEntityWithObject<T>;
				} else {
					target.length = 0;
				}
				return;
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

export type BaseCorePoint = CorePoint<CoreObjectType>;
