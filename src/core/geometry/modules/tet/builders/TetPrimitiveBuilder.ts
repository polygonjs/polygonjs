import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../../ObjectContent';
import {CoreEntity} from '../../../CoreEntity';
import {TetPrimitive} from '../TetPrimitive';
import {TetObject} from '../TetObject';
import {setDifference} from '../../../../SetUtils';
import {primitivesFromObject} from '../../../entities/primitive/CorePrimitiveUtils';

const currentEntities: TetPrimitive[] = [];

export const tetObjectFromPrimitives: ObjectBuilder<CoreObjectType.TET> = (
	object: ObjectContent<CoreObjectType.TET>,
	entities: CoreEntity[]
) => {
	const tetObject = object as ObjectContent<CoreObjectType.TET> as TetObject;
	const geometry = tetObject.geometry;
	if (!geometry) {
		return undefined;
	}
	const entitiesCount = entities.length;

	// remove tet
	const currentEntitiesIndices = primitivesFromObject(tetObject, currentEntities).map((e) => e.index());
	const newEntitiesIndices = entities.map((e, i) => e.index());
	const currentEntitiesIndicesSet = new Set(currentEntitiesIndices);
	const newEntitiesIndicesSet = new Set(newEntitiesIndices);
	const toRemoveEntitiesIndicesSet: Set<number> = new Set();
	setDifference(currentEntitiesIndicesSet, newEntitiesIndicesSet, toRemoveEntitiesIndicesSet);
	// const removedEntitiesIndices: number[] = [];
	// setToArray(removedEntitiesIndicesSet, removedEntitiesIndices);
	const _tetrahedronsIds: number[] = [];
	let i = 0;
	geometry.tetrahedrons.forEach((tetrahedron, id) => {
		if (toRemoveEntitiesIndicesSet.has(i)) {
			_tetrahedronsIds.push(id);
		}
		i++;
	});
	geometry.removeTets(_tetrahedronsIds);
	// console.log({currentEntitiesIndices, newEntitiesIndices, removedEntitiesIndicesSet});

	// update primitive attributes
	const primitiveAttributes = TetPrimitive.attributes(object);
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

	return tetObject;
};
