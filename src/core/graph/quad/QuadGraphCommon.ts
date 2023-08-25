import {Number2, Number4} from '../../../types/GlobalTypes';

export type QuadHalfEdgeCardinality = 's' | 'n' | 'w' | 'e';
export const QUAD_HALF_EDGE_CARDINALITIES: QuadHalfEdgeCardinality[] = ['s', 'n', 'w', 'e'];
export const CCW_HALF_EDGE_CARDINALITIES: QuadHalfEdgeCardinality[] = ['s', 'e', 'n', 'w'];

const EDGES: [Number2, Number2, Number2, Number2] = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 0],
];
function sortNumber2(n: Number2): Number2 {
	return n[0] < n[1] ? n : [n[1], n[0]];
}
export function edgeId(edge: Number2): string {
	return sortNumber2(edge).join('-');
}
export function quadHalfEdgeIndices(quad: Number4, edgeIndex: number): Number2 {
	const edgeIndices = EDGES[edgeIndex];
	const edge: Number2 = [quad[edgeIndices[0]], quad[edgeIndices[1]]];
	return edge;
}
