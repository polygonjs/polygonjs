import {PointIdPair} from './TriangleBasicGraphCommon';
import {TriangleBasicGraph} from './TriangleBasicGraph';

export interface TriangleBasicEdge {
	triangleIds: number[];
	graph: TriangleBasicGraph;
	id: number;
	pointIdPair: PointIdPair;
}

export function triangleEdgeCreate(
	graph: TriangleBasicGraph,
	triangleId: number,
	id: number,
	pointIdPair: PointIdPair
): TriangleBasicEdge {
	const edge: TriangleBasicEdge = {
		triangleIds: [triangleId],
		graph,
		id,
		pointIdPair,
	};
	return edge;
}
export function triangleEdgeAddTriangle(edge: TriangleBasicEdge, triangleId: number) {
	edge.triangleIds.push(triangleId);
}
