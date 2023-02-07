import {BufferGeometry} from 'three';
interface TextGeometryOffsetParams {
	geometry: BufferGeometry;
	previousGeometry: BufferGeometry;
	lineHeight: number;
}

export function textGeometryOffset(params: TextGeometryOffsetParams) {
	params.previousGeometry.computeBoundingBox();
	params.geometry.computeBoundingBox();
	const previousBbox = params.previousGeometry.boundingBox;
	const currentBbox = params.geometry.boundingBox;

	if (!(previousBbox && currentBbox)) {
		return;
	}
	// const previousHeight = Math.abs(previousBbox.max.y - previousBbox.min.y);
	const currentHeight = Math.abs(currentBbox.max.y - currentBbox.min.y);
	const offset = previousBbox.min.y - (currentHeight + params.lineHeight);
	return offset;
}
