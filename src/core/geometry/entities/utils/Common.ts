import {CoreEntity} from '../../CoreEntity';
import {AttribValue, NumericAttribValue, Vector2Like,Vector3Like,Vector4Like,ColorLike} from '../../../../types/GlobalTypes';
import {Color, Vector2, Vector3, Vector4} from 'three';
import { CoreObjectType, ObjectContent } from '../../ObjectContent';
import { AttribSize } from '../../Constant';
import {isNumber,isArray} from '../../../Type'

type GetRelatedCallback<T extends CoreEntity, E extends CoreEntity> = (entity: T) => E[];

export function uniqRelatedEntities<T extends CoreEntity, E extends CoreEntity>(
	entities: T[],
	callback: GetRelatedCallback<T, E>
): E[] {
	const entityByIndex: Map<number, E> = new Map();
	for (const entity of entities) {
		const relatedEntities = callback(entity);
		for (const relatedEntity of relatedEntities) {
			let newEntity = entityByIndex.get(relatedEntity.index());
			if (!newEntity) {
				newEntity = relatedEntity;
				entityByIndex.set(newEntity.index(), newEntity);
			}
		}
	}
	const uniqPrimitives = Array.from(entityByIndex.values());
	return uniqPrimitives;
}

export function attribValueNonPrimitive(src: AttribValue) {
	return src instanceof Color || src instanceof Vector2 || src instanceof Vector3 || src instanceof Vector4;
}
export function copyAttribValue(src: AttribValue, target: AttribValue) {
	if (target instanceof Color && src instanceof Color) {
		target.copy(src);
	}
	if (target instanceof Vector2 && src instanceof Vector2) {
		target.copy(src);
	}
	if (target instanceof Vector3 && src instanceof Vector3) {
		target.copy(src);
	}
	if (target instanceof Vector4 && src instanceof Vector4) {
		target.copy(src);
	}
}

export function cloneAttribValue(src: AttribValue) {
	if (src instanceof Color) {
		return src.clone();
	}
	if (src instanceof Vector2) {
		return src.clone();
	}
	if (src instanceof Vector3) {
		return src.clone();
	}
	if (src instanceof Vector4) {
		return src.clone();
	}
}

export interface AttributeNumericValuesOptions {
	attributeAdded: boolean;
	values: number[];
}
type EntitiesCountFunction<T extends CoreObjectType> = (object: ObjectContent<T>) => number;
export function attributeNumericValues<T extends CoreObjectType>(
	object: ObjectContent<T>,
	entitiesCountFunction:EntitiesCountFunction<T>,
	attribSize: AttribSize = 1,
	defaultValue: NumericAttribValue = 0,
	target: AttributeNumericValuesOptions
) {
	target.values.length = 0;
	const values = target.values;
	const entitiesCount = entitiesCountFunction(object);

	if (isNumber(defaultValue)) {
		// adding number
		for (let i = 0; i < entitiesCount; i++) {
			for (let j = 0; j < attribSize; j++) {
				values.push(defaultValue);
			}
		}
		target.attributeAdded = true;
	} else {
		if (attribSize > 1) {
			if (isArray(defaultValue)) {
				// adding array
				for (let i = 0; i < entitiesCount; i++) {
					for (let j = 0; j < attribSize; j++) {
						values.push(defaultValue[j]);
					}
				}
				target.attributeAdded = true;
			} else {
				// adding Vector2
				const vec2 = defaultValue as Vector2Like;
				if (attribSize == 2 && vec2.x != null && vec2.y != null) {
					for (let i = 0; i < entitiesCount; i++) {
						values.push(vec2.x);
						values.push(vec2.y);
					}
					target.attributeAdded = true;
				}
				// adding Vector3
				const vec3 = defaultValue as Vector3Like;
				if (attribSize == 3 && vec3.x != null && vec3.y != null && vec3.z != null) {
					for (let i = 0; i < entitiesCount; i++) {
						values.push(vec3.x);
						values.push(vec3.y);
						values.push(vec3.z);
					}
					target.attributeAdded = true;
				}
				// adding Color
				const col = defaultValue as ColorLike;
				if (attribSize == 3 && col.r != null && col.g != null && col.b != null) {
					for (let i = 0; i < entitiesCount; i++) {
						values.push(col.r);
						values.push(col.g);
						values.push(col.b);
					}
					target.attributeAdded = true;
				}
				// adding Vector4
				const vec4 = defaultValue as Vector4Like;
				if (attribSize == 4 && vec4.x != null && vec4.y != null && vec4.z != null && vec4.w != null) {
					for (let i = 0; i < entitiesCount; i++) {
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
