import {Object3D} from 'three';
import {QuadObject} from '../QuadObject';
import {QUADTesselationParams} from '../QuadCommon';
import {quadToMesh} from './QuadToMesh';
import {quadToLine} from './QuadToLine';
import {quadToCenter} from './QuadToPoint';
import {quadToConnections} from './QuadToConnections';
import {quadGraphFromQuadObject} from '../graph/QuadGraphUtils';

export function quadToObject3D(quadObject: QuadObject, options: QUADTesselationParams): Object3D[] | undefined {
	const objects: Object3D[] = [];

	const graph = options.wireframe || options.connections ? quadGraphFromQuadObject(quadObject) : null;

	if (options.triangles) {
		objects.push(quadToMesh(quadObject, options));
	}
	if (options.wireframe && graph) {
		objects.push(quadToLine(quadObject, graph, options));
	}
	if (options.connections && graph) {
		objects.push(quadToConnections(quadObject, graph, options));
	}
	if (options.center) {
		objects.push(quadToCenter(quadObject, options));
	}
	return objects;
}
