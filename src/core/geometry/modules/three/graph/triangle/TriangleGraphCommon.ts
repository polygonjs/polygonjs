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
function sortPointIdPair(ids: PointIdPair): PointIdPair {
	if (ids.id0 > ids.id1) {
		const temp = ids.id0;
		ids.id0 = ids.id1;
		ids.id1 = temp;
	}
	return ids;
}
export function edgeId(ids: PointIdPair): string {
	sortPointIdPair(ids);
	return `${ids.id0}-${ids.id1}`;
}
export function triangleEdge(triangle: Number3, edgeIndex: number): PointIdPair {
	const edgeIndices = EDGES[edgeIndex];
	// const edge: Number2 = [triangle[edgeIndices[0]], triangle[edgeIndices[1]]];
	return {
		id0: triangle[edgeIndices[0]],
		id1: triangle[edgeIndices[1]],
	};
}
