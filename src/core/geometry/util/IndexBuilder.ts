import lodash_range from 'lodash/range';

import {BufferGeometry} from 'three/src/core/BufferGeometry';

export class CoreGeometryIndexBuilder {
	static create_index_if_none(geometry: BufferGeometry) {
		if (!geometry.index) {
			const position_array = geometry.getAttribute('position').array;
			geometry.setIndex(lodash_range(position_array.length / 3));
		}
	}
}
