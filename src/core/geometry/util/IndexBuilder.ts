import lodash_range from 'lodash/range';

import {BufferGeometry} from 'three/src/core/BufferGeometry';

const POSITION = 'position';
export class CoreGeometryIndexBuilder {
	static create_index_if_none(geometry: BufferGeometry) {
		if (!geometry.index) {
			const position = geometry.getAttribute(POSITION);
			if (position) {
				const position_array = position.array;
				geometry.setIndex(lodash_range(position_array.length / 3));
			}
		}
	}
}
