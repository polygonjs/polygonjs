import {BufferGeometry} from 'three/src/core/BufferGeometry';
import { ArrayUtils } from '../../ArrayUtils';

const POSITION = 'position';
export class CoreGeometryIndexBuilder {
	static create_index_if_none(geometry: BufferGeometry) {
		if (!geometry.index) {
			const position = geometry.getAttribute(POSITION);
			if (position) {
				const position_array = position.array;
				geometry.setIndex(ArrayUtils.range(position_array.length / 3));
			}
		}
	}
}
