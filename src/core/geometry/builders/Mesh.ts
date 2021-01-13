import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometryBuilderBase} from './_Base';
import {CorePoint} from '../Point';
import {PolyDictionary} from '../../../types/GlobalTypes';

export class CoreGeometryBuilderMesh extends CoreGeometryBuilderBase {
	protected _filter_points(points: CorePoint[]) {
		// ensures we only keep points that form a full face.
		// if a single point from a face is discarded, we remove all 3

		const first_point = points[0];
		if (first_point) {
			const geometry = first_point.geometry();
			const indices = geometry.getIndex()?.array;

			if (indices) {
				const points_by_index: PolyDictionary<CorePoint> = {};
				for (let point of points) {
					points_by_index[point.index()] = point;
				}
				const filtered_points: CorePoint[] = [];

				const index_length = indices.length;
				let pt0: CorePoint;
				let pt1: CorePoint;
				let pt2: CorePoint;
				for (let i = 0; i < index_length; i += 3) {
					pt0 = points_by_index[indices[i + 0]];
					pt1 = points_by_index[indices[i + 1]];
					pt2 = points_by_index[indices[i + 2]];
					if (pt0 && pt1 && pt2) {
						filtered_points.push(pt0);
						filtered_points.push(pt1);
						filtered_points.push(pt2);
					}
				}

				return filtered_points;
			}
		}
		return [];
	}

	protected _indices_from_points(new_index_by_old_index: PolyDictionary<number>, old_geometry: BufferGeometry) {
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
