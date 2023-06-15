import {TetEdge} from '../TetrahedronConstant';
import {compareEdges, equalEdges} from '../TetrahedronUtils';

interface FixNeighboursOptions {
	edges: TetEdge[];
	neighbors: number[];
}
export function _fixNeighbours(options: FixNeighboursOptions) {
	const {edges, neighbors} = options;
	const sortedEdges = edges.sort(compareEdges);
	let nr = 0;
	const numEdges = sortedEdges.length;
	while (nr < numEdges) {
		const e0 = sortedEdges[nr];
		nr++;
		if (nr < numEdges && equalEdges(sortedEdges[nr], e0)) {
			const e1 = sortedEdges[nr];

			//  id0 = tetIds[4 * e0[2]]
			//  id1 = tetIds[4 * e0[2] + 1]
			//  id2 = tetIds[4 * e0[2] + 2]
			//  id3 = tetIds[4 * e0[2] + 3]

			// const jd0 = tetIds[4 * e1[2]]
			// const jd1 = tetIds[4 * e1[2] + 1]
			// const jd2 = tetIds[4 * e1[2] + 2]
			// const jd3 = tetIds[4 * e1[2] + 3]

			neighbors[4 * e0[2] + e0[3]] = e1[2];
			neighbors[4 * e1[2] + e1[3]] = e0[2];
			nr = nr + 1;
		}
	}
}
