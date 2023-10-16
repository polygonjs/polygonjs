import {Vector4} from 'three';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../../ObjectContent';
import {CoreEntity} from '../../../CoreEntity';
import {QuadPrimitive} from '../QuadPrimitive';
import {QuadObject} from '../QuadObject';

const _v4 = new Vector4();
const STRIDE = 4;
export const quadObjectFromPrimitives: ObjectBuilder<CoreObjectType.QUAD> = (
	object: ObjectContent<CoreObjectType.QUAD>,
	entities: CoreEntity[]
) => {
	const quadObject = object as ObjectContent<CoreObjectType.QUAD> as QuadObject;
	const geometry = quadObject.geometry;
	if (!geometry) {
		return undefined;
	}
	const oldIndex = geometry.index;
	if (!oldIndex) {
		return undefined;
	}
	const oldIndexArray = [...oldIndex];

	const entitiesCount = entities.length;
	const newIndices = new Array(entitiesCount * STRIDE);

	let i = 0;
	for (const primitive of entities) {
		_v4.fromArray(oldIndexArray, primitive.index() * STRIDE);
		_v4.toArray(newIndices, i * STRIDE);
		i++;
	}
	geometry.setIndex(newIndices);

	// update primitive attributes
	const primitiveAttributes = QuadPrimitive.attributes(object);
	if (primitiveAttributes) {
		const primitiveAttributeNames = Object.keys(primitiveAttributes);
		for (const primitiveAttributeName of primitiveAttributeNames) {
			const primitiveAttribute = primitiveAttributes[primitiveAttributeName];
			const itemSize = primitiveAttribute.itemSize;
			const srcArray = primitiveAttribute.array;
			const newArray = new Array(entitiesCount * itemSize);
			let i = 0;
			for (const entity of entities) {
				const index = entity.index();
				for (let k = 0; k < itemSize; k++) {
					newArray[i + k] = srcArray[index + k];
				}
				i++;
			}
			primitiveAttribute.array = newArray;
		}
	}

	return quadObject;
};
