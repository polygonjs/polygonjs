import {Number4} from '../../../../../types/GlobalTypes';

export type QuadHalfEdgeSide = 's' | 'n' | 'w' | 'e';
// export const QUAD_HALF_EDGE_SIDES: QuadHalfEdgeSide[] = ['s', 'n', 'w', 'e'];
export const CCW_HALF_EDGE_SIDES: QuadHalfEdgeSide[] = ['s', 'e', 'n', 'w'];

export interface HalfEdgeIndices {
	index0: number;
	index1: number;
}
export type NeighbourIndex = 0 | 1 | 2 | 3;
export const NEIGHBOUR_INDICES: NeighbourIndex[] = [0, 1, 2, 3];

export function quadHalfEdgeIndices(quad: Number4, edgeIndex: number, target: HalfEdgeIndices): void {
	target.index0 = quad[edgeIndex];
	target.index1 = quad[edgeIndex == 3 ? 0 : edgeIndex + 1];
}
