import {Vector4} from 'three';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../../ObjectContent';
import {CoreEntity} from '../../../Entity';
import {QuadPrimitive} from '../QuadPrimitive';
import {QuadObject} from '../QuadObject';

const _v4 = new Vector4();
const STRIDE = 4;
export const quadObjectFromPrimitives: ObjectBuilder<CoreObjectType.QUAD> = (
	object: ObjectContent<CoreObjectType.QUAD>,
	entities: CoreEntity[]
) => {
	const mesh = object as ObjectContent<CoreObjectType.QUAD> as QuadObject;
	const geometry = mesh.geometry;
	if (!geometry) {
		return undefined;
	}
	const oldIndex = geometry.index;
	if (!oldIndex) {
		return undefined;
	}
	const oldIndexArray = [...oldIndex];

	const primitives = entities as QuadPrimitive[];

	const newIndices = new Array(primitives.length * STRIDE);

	let i = 0;
	for (const primitive of primitives) {
		_v4.fromArray(oldIndexArray, primitive.index() * STRIDE);
		_v4.toArray(newIndices, i * STRIDE);
		i++;
	}
	geometry.setIndex(newIndices);

	return mesh;
};
