import {Number2, Number3} from '../../../../../../types/GlobalTypes';
const EDGES: [Number2, Number2, Number2] = [
	[0, 1],
	[1, 2],
	[2, 0],
];
export interface PointIdPair {
	id0: number;
	id1: number;
}

export function triangleBasicEdge(triangle: Number3, edgeIndex: number): PointIdPair {
	const edgeIndices = EDGES[edgeIndex];
	return {
		id0: triangle[edgeIndices[0]],
		id1: triangle[edgeIndices[1]],
	};
}
