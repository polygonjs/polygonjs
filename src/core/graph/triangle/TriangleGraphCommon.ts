import {Number2, Number3} from '../../../types/GlobalTypes';
const EDGES: [Number2, Number2, Number2] = [
	[0, 1],
	[1, 2],
	[2, 0],
];
function sortNumber2(n: Number2): Number2 {
	return n[0] < n[1] ? n : [n[1], n[0]];
}
export function edgeId(edge: Number2): string {
	return sortNumber2(edge).join('-');
}
export function triangleEdge(triangle: Number3, edgeIndex: number): Number2 {
	const edgeIndices = EDGES[edgeIndex];
	const edge: Number2 = [triangle[edgeIndices[0]], triangle[edgeIndices[1]]];
	return edge;
}
