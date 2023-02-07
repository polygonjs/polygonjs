import {ExtrudeGeometry, ExtrudeGeometryOptions, Shape} from 'three';
import {mergeBufferGeometries} from '../../../modules/three/examples/jsm/utils/BufferGeometryUtils';

export interface BevelParams {
	bevelEnabled: boolean;
	bevelThickness: number;
	bevelSize: number;
	bevelOffset: number;
	bevelSegments: number;
}

interface CommonParams extends BevelParams {
	extrude: number;
	curveSegments: number;
}

interface TextMeshesParams extends CommonParams {
	shapes: Array<Array<Shape>>;
}
interface TextMeshParams extends CommonParams {
	shapes: Shape[];
}

export function createGeometriesFromTypeMesh(params: TextMeshesParams) {
	return params.shapes?.map((shapes) => createGeometryFromTypeMesh({...params, shapes}));
}
function createGeometryFromTypeMesh(params: TextMeshParams) {
	const extrudeParams: ExtrudeGeometryOptions = {
		curveSegments: params.curveSegments,
		depth: params.extrude,
		bevelEnabled: params.bevelEnabled,
		bevelThickness: params.bevelThickness,
		bevelSize: params.bevelSize,
		bevelOffset: params.bevelOffset,
		bevelSegments: params.bevelSegments,
	};
	const geometries = params.shapes.map((s) => new ExtrudeGeometry(s, extrudeParams));
	if (geometries == null || geometries.length == 0) {
		return;
	}
	return mergeBufferGeometries(geometries);
}
