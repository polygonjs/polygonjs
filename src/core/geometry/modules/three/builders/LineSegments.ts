import {BufferGeometry} from 'three';
import {CoreGeometryBuilderBase} from './_Base';
import {CorePoint} from '../../../entities/point/CorePoint';
import {PolyDictionary} from '../../../../../types/GlobalTypes';

export class CoreGeometryBuilderLineSegments extends CoreGeometryBuilderBase {
	protected _filterPoints(points: CorePoint[]): CorePoint[] {
		// ensures we only keep points that form a full segment.
		// if a single point from a segment is discarded, we remove both

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
		for (const point of points) {
			points_by_index[point.index()] = point;
		}
		const filteredPoints: CorePoint[] = [];

		const index_length = indices.length;
		for (let i = 0; i < index_length; i += 2) {
			const pt0 = points_by_index[indices[i + 0]];
			const pt1 = points_by_index[indices[i + 1]];
			if (pt0 && pt1) {
				filteredPoints.push(pt0);
				filteredPoints.push(pt1);
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
			let new_index0: number;
			let new_index1: number;
			for (let i = 0; i < old_indices.length; i += 2) {
				old_index0 = old_indices[i];
				old_index1 = old_indices[i + 1];
				new_index0 = new_index_by_old_index[old_index0];
				new_index1 = new_index_by_old_index[old_index1];
				if (new_index0 != null && new_index1 != null) {
					new_indices.push(new_index0);
					new_indices.push(new_index1);
				}
			}

			return new_indices;
		}
	}
}
