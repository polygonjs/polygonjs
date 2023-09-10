import {BufferGeometry, Mesh, Vector3} from 'three';
import {CoreGeometryBuilderBase} from './_Base';
import {CorePoint} from '../../Point';
import {PolyDictionary} from '../../../../types/GlobalTypes';
import {CoreObjectType, ObjectBuilder, ObjectContent} from '../../ObjectContent';
import {CoreEntity} from '../../Entity';
import {TrianglePrimitive} from '../TrianglePrimitive';

export class CoreGeometryBuilderMesh extends CoreGeometryBuilderBase {
	protected _filterPoints(points: CorePoint[]): CorePoint[] {
		// ensures we only keep points that form a full face.
		// if a single point from a face is discarded, we remove all 3

		const firstPoint = points[0];
		if (!firstPoint) {
			return [];
		}
		const geometry = firstPoint.geometry();
		if (!geometry) {
			return [];
		}
		const indices = geometry.getIndex()?.array;
		if (!indices) {
			return [];
		}

		const points_by_index: PolyDictionary<CorePoint> = {};
		for (let point of points) {
			points_by_index[point.index()] = point;
		}
		const filteredPoints: CorePoint[] = [];

		const index_length = indices.length;
		let pt0: CorePoint;
		let pt1: CorePoint;
		let pt2: CorePoint;
		for (let i = 0; i < index_length; i += 3) {
			pt0 = points_by_index[indices[i + 0]];
			pt1 = points_by_index[indices[i + 1]];
			pt2 = points_by_index[indices[i + 2]];
			if (pt0 && pt1 && pt2) {
				filteredPoints.push(pt0);
				filteredPoints.push(pt1);
				filteredPoints.push(pt2);
			}
		}

		return filteredPoints;
	}

	protected _indicesFromPoints(new_index_by_old_index: PolyDictionary<number>, old_geometry: BufferGeometry) {
		const index_attrib = old_geometry.index;
		if (index_attrib != null) {
			const old_indices = index_attrib.array;

			const new_indices: number[] = [];

			let old_index0: number;
			let old_index1: number;
			let old_index2: number;
			let new_index0: number;
			let new_index1: number;
			let new_index2: number;
			for (let i = 0; i < old_indices.length; i += 3) {
				old_index0 = old_indices[i + 0];
				old_index1 = old_indices[i + 1];
				old_index2 = old_indices[i + 2];
				new_index0 = new_index_by_old_index[old_index0];
				new_index1 = new_index_by_old_index[old_index1];
				new_index2 = new_index_by_old_index[old_index2];
				if (new_index0 != null && new_index1 != null && new_index2 != null) {
					new_indices.push(new_index0);
					new_indices.push(new_index1);
					new_indices.push(new_index2);
				}
			}

			return new_indices;
		}
	}
}

const _v3 = new Vector3();
const STRIDE = 3;
export const threeMeshFromPrimitives: ObjectBuilder<CoreObjectType.THREEJS> = (
	object: ObjectContent<CoreObjectType.THREEJS>,
	entities: CoreEntity[]
) => {
	const mesh = object as ObjectContent<CoreObjectType.THREEJS> as Mesh;
	const geometry = mesh.geometry;
	if (!geometry) {
		return undefined;
	}
	const oldIndex = geometry.getIndex();
	if (!oldIndex) {
		return undefined;
	}
	const oldIndexArray = oldIndex.array;

	const primitives = entities as TrianglePrimitive[];

	const newIndices = new Array(primitives.length * STRIDE);

	let i = 0;
	for (const primitive of primitives) {
		_v3.fromArray(oldIndexArray, primitive.index() * STRIDE);
		_v3.toArray(newIndices, i * STRIDE);
		i++;
	}
	geometry.setIndex(newIndices);

	return mesh;
};
