import {BufferAttribute, BufferGeometry} from 'three';
import {range} from '../../ArrayUtils';

const POSITION = 'position';
export class CoreGeometryIndexBuilder {
	static createIndexIfNone(geometry: BufferGeometry) {
		if (!geometry.index) {
			const position = geometry.getAttribute(POSITION) as BufferAttribute;
			if (position) {
				const position_array = position.array;
				geometry.setIndex(range(position_array.length / 3));
			}
		}
	}
}
