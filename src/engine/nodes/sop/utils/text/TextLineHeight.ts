import {Box3, BufferGeometry} from 'three';

export interface TextLineHeightParams {
	lineHeight: number;
}

export function applyTextLineHeight(geometries: Array<BufferGeometry | undefined>, params: TextLineHeightParams) {
	if (geometries.length == 0) {
		return;
	}
	if (params.lineHeight == 1) {
		return;
	}

	let totalBoundingBox: Box3 | null = null;
	for (let geometry of geometries) {
		if (!geometry) continue;
		geometry.computeBoundingBox();
		if (geometry.boundingBox) {
			if (totalBoundingBox == null) {
				totalBoundingBox = geometry.boundingBox;
			} else {
				totalBoundingBox.union(geometry.boundingBox);
			}
		}
	}
	if (!totalBoundingBox) {
		return;
	}
	const expectedMin = totalBoundingBox.min.y * params.lineHeight;
	const delta = expectedMin - totalBoundingBox.min.y;
	for (let geometry of geometries) {
		geometry?.translate(0, delta, 0);
	}
}
