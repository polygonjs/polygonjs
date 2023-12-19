import {Object3D} from 'three';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams} from '../QuadCommon';
import {quadToMesh} from './QuadToMesh';
import {quadToLine} from './QuadToLine';
import {quadToCenter} from './QuadToPoint';

export function quadToObject3D(quadObject: QuadObject, options: QUADTesselationParams): Object3D[] | undefined {
	const objects: Object3D[] = [];
	if (options.triangles) {
		objects.push(quadToMesh(quadObject, options));
	}
	if (options.wireframe) {
		objects.push(quadToLine(quadObject, options));
	}
	if (options.center) {
		objects.push(quadToCenter(quadObject, options));
	}
	return objects;
}
