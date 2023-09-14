import {
	ColorLike,
	NumericAttribValue,
	PolyDictionary,
	Vector2Like,
	Vector3Like,
	Vector4Like,
} from '../../../../types/GlobalTypes';
import {ArrayUtils} from '../../../ArrayUtils';
import {CoreString} from '../../../String';
import {AttribSize, AttribType, GroupString} from '../../Constant';
import {corePointClassFactory, corePointInstanceFactory} from '../../CoreObjectFactory';
import {CoreGroup} from '../../Group';
import {CoreObjectType, ObjectContent} from '../../ObjectContent';
import {TypedCorePoint} from './CorePoint';
import {isNumber, isArray} from '../../../Type';

export function points(coreGroup: CoreGroup) {
	return coreGroup
		.allCoreObjects()
		.map((o) => pointsFromObject(o.object()))
		.flat();
}
export function pointsAttribNamesFromCoreGroup(coreGroup: CoreGroup): string[] {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return pointAttributeNames(firstObject);
	} else {
		return [];
	}
}
export function pointAttribSizesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribSize> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return pointAttributeSizes(firstObject);
	} else {
		return {};
	}
}
export function pointAttribTypesFromCoreGroup(coreGroup: CoreGroup): PolyDictionary<AttribType> {
	const firstObject = coreGroup.allObjects()[0];
	if (firstObject) {
		return pointAttributeTypes(firstObject);
	} else {
		return {};
	}
}

export function pointsCountFromObject<T extends CoreObjectType>(object: ObjectContent<T>): number {
	const pointClass = corePointClassFactory(object);
	return pointClass.pointsCount(object);
}
export function pointsFromObject<T extends CoreObjectType>(object: ObjectContent<T>): TypedCorePoint<T>[] {
	const pointClass = corePointClassFactory(object);
	const pointsCount = pointClass.pointsCount(object);
	const points: TypedCorePoint<T>[] = new Array(pointsCount);
	for (let i = 0; i < pointsCount; i++) {
		points[i] = corePointInstanceFactory(object, i);
	}
	return points;
}

export function pointsFromObjectFromGroup<T extends CoreObjectType>(
	object: ObjectContent<T>,
	group: GroupString
): TypedCorePoint<T>[] {
	if (group) {
		const indices = CoreString.indices(group);
		if (indices) {
			const points = pointsFromObject(object);
			return ArrayUtils.compact(indices.map((i) => points[i]));
		} else {
			return [];
		}
	} else {
		return pointsFromObject(object);
	}
}

export function hasPointAttribute<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): boolean {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return false;
	}
	return attribName in attributes;
}
export function pointAttributeNames<T extends CoreObjectType>(object: ObjectContent<T>): string[] {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return [];
	}
	return Object.keys(attributes);
}
export function pointAttributeSize<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): number {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return 0;
	}
	return attributes[attribName].itemSize;
}
export function pointAttributeSizes<T extends CoreObjectType>(object: ObjectContent<T>): PolyDictionary<AttribSize> {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return {};
	}
	const attribNames = Object.keys(attributes);
	const h: PolyDictionary<AttribSize> = {};
	for (const attribName of attribNames) {
		h[attribName] = attributes[attribName].itemSize;
	}
	return h;
}
export function pointAttributeType<T extends CoreObjectType>(object: ObjectContent<T>, attribName: string): AttribType {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return AttribType.NUMERIC;
	}
	return TypedCorePoint.attribType(object, attribName);
}
export function pointAttributeTypes<T extends CoreObjectType>(object: ObjectContent<T>): PolyDictionary<AttribType> {
	const pointClass = corePointClassFactory(object);
	const attributes = pointClass.attributes(object);
	if (!attributes) {
		return {};
	}
	const attribNames = Object.keys(attributes);
	const h: PolyDictionary<AttribType> = {};
	for (const attribName of attribNames) {
		h[attribName] = TypedCorePoint.attribType(object, attribName);
	}
	return h;
}

export interface PointAttributeNumericValuesOptions {
	attributeAdded: boolean;
	values: number[];
}
export function pointAttributeNumericValues<T extends CoreObjectType>(
	object: ObjectContent<T>,
	size: number = 1,
	defaultValue: NumericAttribValue = 0,
	target: PointAttributeNumericValuesOptions
) {
	target.values.length = 0;
	const values = target.values;
	const pointsCount = pointsCountFromObject(object);

	if (isNumber(defaultValue)) {
		// adding number
		for (let i = 0; i < pointsCount; i++) {
			for (let j = 0; j < size; j++) {
				values.push(defaultValue);
			}
		}
		target.attributeAdded = true;
	} else {
		if (size > 1) {
			if (isArray(defaultValue)) {
				// adding array
				for (let i = 0; i < pointsCount; i++) {
					for (let j = 0; j < size; j++) {
						values.push(defaultValue[j]);
					}
				}
				target.attributeAdded = true;
			} else {
				// adding Vector2
				const vec2 = defaultValue as Vector2Like;
				if (size == 2 && vec2.x != null && vec2.y != null) {
					for (let i = 0; i < pointsCount; i++) {
						values.push(vec2.x);
						values.push(vec2.y);
					}
					target.attributeAdded = true;
				}
				// adding Vector3
				const vec3 = defaultValue as Vector3Like;
				if (size == 3 && vec3.x != null && vec3.y != null && vec3.z != null) {
					for (let i = 0; i < pointsCount; i++) {
						values.push(vec3.x);
						values.push(vec3.y);
						values.push(vec3.z);
					}
					target.attributeAdded = true;
				}
				// adding Color
				const col = defaultValue as ColorLike;
				if (size == 3 && col.r != null && col.g != null && col.b != null) {
					for (let i = 0; i < pointsCount; i++) {
						values.push(col.r);
						values.push(col.g);
						values.push(col.b);
					}
					target.attributeAdded = true;
				}
				// adding Vector4
				const vec4 = defaultValue as Vector4Like;
				if (size == 4 && vec4.x != null && vec4.y != null && vec4.z != null && vec4.w != null) {
					for (let i = 0; i < pointsCount; i++) {
						values.push(vec4.x);
						values.push(vec4.y);
						values.push(vec4.z);
						values.push(vec4.w);
					}
					target.attributeAdded = true;
				}
			}
		}
	}
}
