import {BufferGeometry} from 'three/src/core/BufferGeometry';
import {CoreGeometryBuilderBase} from './_Base';
import {CorePoint} from '../Point';

export class CoreGeometryBuilderPoints extends CoreGeometryBuilderBase {
	protected _filter_points(points: CorePoint[]) {
		return points;
	}

	protected _indices_from_points(new_index_by_old_index: Dictionary<number>, old_geometry: BufferGeometry) {
		const index_attrib = old_geometry.index;
		if (index_attrib != null) {
			const old_indices = index_attrib.array;

			const new_indices: number[] = [];

			let old_index: number;
			let new_index: number;
			for (let i = 0; i < old_indices.length; i++) {
				old_index = old_indices[i];
				new_index = new_index_by_old_index[old_index];
				if (new_index != null) {
					new_indices.push(new_index);
				}
			}

			return new_indices;
		}
	}
}
