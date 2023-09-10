import {Number2} from '../../../../../types/GlobalTypes';
import {setToArray} from '../../../../SetUtils';
import {TetGeometry} from '../TetGeometry';

export function buildTetIds(tetGeometry: TetGeometry, newOrderByPoint: Map<number, number>) {
	const tetIds: number[] = new Array<number>(tetGeometry.tetsCount() * 4);
	let pointIndex = 0;
	tetGeometry.tetrahedrons.forEach((tet) => {
		for (let i = 0; i < 4; i++) {
			const id = tet.pointIds[i];
			const index = newOrderByPoint.get(id);
			if (index == null) {
				throw 'id not found';
			}
			tetIds[pointIndex] = index;
			pointIndex++;
		}
	});
	return tetIds;
}
const EDGE_INDICES: Number2[] = [
	[0, 1],
	[0, 2],
	[0, 3],
	[1, 2],
	[1, 3],
	[2, 3],
];
export function buildTetEdgeIds(tetGeometry: TetGeometry, newOrderByPoint: Map<number, number>) {
	const edgeEndsByStart: Map<number, Set<number>> = new Map();
	let edgesCount = 0;
	const startIds: Set<number> = new Set();
	tetGeometry.tetrahedrons.forEach((tet) => {
		for (const edgeIndices of EDGE_INDICES) {
			const id0 = tet.pointIds[edgeIndices[0]];
			const id1 = tet.pointIds[edgeIndices[1]];

			const index0 = newOrderByPoint.get(id0);
			const index1 = newOrderByPoint.get(id1);
			if (index0 == null || index1 == null) {
				throw 'id not found';
			}
			const minIndex = Math.min(index0, index1);
			const maxIndex = Math.max(index0, index1);
			let edgeEnds = edgeEndsByStart.get(minIndex);
			if (!edgeEnds) {
				edgeEnds = new Set();
				edgeEndsByStart.set(minIndex, edgeEnds);
				startIds.add(minIndex);
			}
			if (!edgeEnds.has(maxIndex)) {
				edgeEnds.add(maxIndex);
				edgesCount++;
			}
		}
	});
	const startIdsSorted = setToArray(startIds).sort((a, b) => a - b);
	const edgeIds: number[] = new Array<number>(edgesCount * 2);
	let i = 0;
	for (const startId of startIdsSorted) {
		const endIds = edgeEndsByStart.get(startId)!;
		const endIdsSorted = setToArray(endIds).sort((a, b) => a - b);
		for (const endId of endIdsSorted) {
			edgeIds[i] = startId;
			edgeIds[i + 1] = endId;
			i += 2;
		}
	}

	return edgeIds;
}
