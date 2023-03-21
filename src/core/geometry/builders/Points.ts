import {BufferGeometry} from 'three';
import {CoreGeometryBuilderBase} from './_Base';
import {CorePoint} from '../Point';
import {PolyDictionary} from '../../../types/GlobalTypes';

export class CoreGeometryBuilderPoints extends CoreGeometryBuilderBase {
	protected _filterPoints(points: CorePoint[]) {
		return points;
	}

	protected _indicesFromPoints(new_index_by_old_index: PolyDictionary<number>, old_geometry: BufferGeometry) {
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
