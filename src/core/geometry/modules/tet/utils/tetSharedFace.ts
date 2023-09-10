import {TetGeometry} from '../TetGeometry';

interface TetSharedFace {
	faceIndex0: number;
	faceIndex1: number;
}

export function tetsSharedFace(tetGeometry: TetGeometry, tetId0: number, tetId1: number): TetSharedFace | undefined {
	const tet0 = tetGeometry.tetrahedrons.get(tetId0);
	const tet1 = tetGeometry.tetrahedrons.get(tetId1);
	if (!tet0 || !tet1) {
		return;
	}
	for (let neighbourData of tet0.neighbours) {
		if (neighbourData) {
			if (neighbourData.id == tetId1) {
				const faceIndex0 = neighbourData.faceIndex;
				const tet1NeighbourData = tet1.neighbours[faceIndex0];
				if (tet1NeighbourData) {
					const faceIndex1 = tet1NeighbourData.faceIndex;
					return {faceIndex0, faceIndex1};
				}
			}
		}
	}
	return;
}

export function tetsShareFace(tetGeometry: TetGeometry, tetId0: number, tetId1: number): boolean {
	const tet0 = tetGeometry.tetrahedrons.get(tetId0);
	if (!tet0) {
		return false;
	}
	for (let neighbourData of tet0.neighbours) {
		if (neighbourData) {
			if (neighbourData.id == tetId1) {
				return true;
			}
		}
	}
	return false;
}
