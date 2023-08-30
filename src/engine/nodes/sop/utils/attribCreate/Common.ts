import {BufferGeometry, Vector2, Vector3, Vector4} from 'three';

export type ValueArrayByName = Map<string, number[]>;

export type VectorComponent = 'x' | 'y' | 'z' | 'w';
export const COMPONENT_NAMES: Array<VectorComponent> = ['x', 'y', 'z', 'w'];

export function initArrayIfRequired(
	geometry: BufferGeometry,
	arraysByGeometryUuid: ValueArrayByName,
	points_count: number
) {
	const uuid = geometry.uuid;
	const currentArray = arraysByGeometryUuid.get(uuid);
	if (currentArray) {
		// only create new array if we need more point, or as soon as the length is different?
		if (currentArray.length < points_count) {
			arraysByGeometryUuid.set(uuid, new Array(points_count));
		}
	} else {
		arraysByGeometryUuid.set(uuid, new Array(points_count));
	}
	return arraysByGeometryUuid.get(uuid);
}

export function vectorByAttribSize(size: number) {
	switch (size) {
		case 2:
			return new Vector2(0, 0);
		case 3:
			return new Vector3(0, 0, 0);
		case 4:
			return new Vector4(0, 0, 0, 0);
	}
}
