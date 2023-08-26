import {
	// Number2,
	Number4,
} from '../../../types/GlobalTypes';

export type QuadHalfEdgeSide = 's' | 'n' | 'w' | 'e';
export const QUAD_HALF_EDGE_SIDES: QuadHalfEdgeSide[] = ['s', 'n', 'w', 'e'];
export const CCW_HALF_EDGE_SIDES: QuadHalfEdgeSide[] = ['s', 'e', 'n', 'w'];

// const EDGES: [Number2, Number2, Number2, Number2] = [
// 	[0, 1],
// 	[1, 2],
// 	[2, 3],
// 	[3, 0],
// ];

export interface HalfEdgeIndices {
	index0: number;
	index1: number;
}
export type NeighbourIndex = 0 | 1 | 2 | 3;
export type NeighbourSides = [
	QuadHalfEdgeSide | null,
	QuadHalfEdgeSide | null,
	QuadHalfEdgeSide | null,
	QuadHalfEdgeSide | null
];

export function quadHalfEdgeIndices(quad: Number4, edgeIndex: number, target: HalfEdgeIndices): void {
	// const edgeIndices = EDGES[edgeIndex];
	target.index0 = quad[edgeIndex];
	target.index1 = quad[edgeIndex == 3 ? 0 : edgeIndex + 1]; //quad[edgeIndices[1]];
}
