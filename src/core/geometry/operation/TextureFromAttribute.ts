import {BufferAttribute, BufferGeometry} from 'three';

export function textureFromAttributeSize(geometry: BufferGeometry) {
	const position = geometry.attributes.position;
	if (!(position instanceof BufferAttribute)) {
		console.warn('position is not a BufferAttribute');
		return;
	}
	const pointsCount = position.count;
	return Math.ceil(Math.sqrt(pointsCount));
}
