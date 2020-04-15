import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometryBuilderBase} from './_Base';
import {CorePoint} from '../Point';

export class CoreGeometryBuilderLineSegments extends CoreGeometryBuilderBase {
	protected _filter_points(points: CorePoint[]) {
		// ensures we only keep points that form a full segment.
		// if a single point from a segment is discarded, we remove both

		const first_point = points[0];
		if (first_point) {
			const geometry = first_point.geometry();
			const indices = geometry.getIndex()?.array;

			if (indices) {
				const points_by_index: Dictionary<CorePoint> = {};
				for (let point of points) {
					points_by_index[point.index] = point;
				}
				const filtered_points: CorePoint[] = [];

				const index_length = indices.length;
				let pt0: CorePoint;
				let pt1: CorePoint;
				for (let i = 0; i < index_length; i += 2) {
					pt0 = points_by_index[indices[i + 0]];
					pt1 = points_by_index[indices[i + 1]];
					if (pt0 && pt1) {
						filtered_points.push(pt0);
						filtered_points.push(pt1);
					}
				}

				return filtered_points;
			}
		}
		return [];
	}

	protected _indices_from_points(new_index_by_old_index: Dictionary<number>, old_geometry: BufferGeometry) {
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
