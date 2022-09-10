import {Shape, ShapeGeometry} from 'three';
import {mergeBufferGeometries} from '../../../../../modules/three/examples/jsm/utils/BufferGeometryUtils';
interface TextFlatsParams {
	shapes?: Array<Array<Shape>>;
}
interface TextFlatParams {
	shapes?: Shape[];
}

export function createGeometriesFromTypeFlat(params: TextFlatsParams) {
	return params.shapes?.map((shapes) => createGeometryFromTypeFlat({shapes}));
}
function createGeometryFromTypeFlat(params: TextFlatParams) {
	const geometries = params.shapes?.map((s) => new ShapeGeometry(s)) || [];
	if (geometries == null || geometries.length == 0) {
		return;
	}
	return mergeBufferGeometries(geometries);
}
