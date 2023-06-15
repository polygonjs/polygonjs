import {Vector3} from 'three';

const _center = new Vector3();

interface FindContainingTetOptions {
	vertPos: Vector3;
	tetMarks: number[];
	tetNr: number;
	tetMark: number;
	tetIds: number[];
	verts: Vector3[];
	planesN: Vector3[];
	planesD: number[];
	neighbors: number[];
}

interface FindContainingTetResult {
	found: boolean;
	tetNr: number;
}
export function _findContainingTet(options: FindContainingTetOptions): FindContainingTetResult {
	const {tetMarks, tetMark, tetIds, verts, neighbors, planesN, planesD, vertPos} = options;
	let {tetNr} = options;
	let found = false;
	while (!found) {
		if (tetNr < 0 || tetMarks[tetNr] == tetMark) {
			break;
		}
		tetMarks[tetNr] = tetMark;

		const id0 = tetIds[4 * tetNr];
		const id1 = tetIds[4 * tetNr + 1];
		const id2 = tetIds[4 * tetNr + 2];
		const id3 = tetIds[4 * tetNr + 3];

		_center.copy(verts[id0]).add(verts[id1]).add(verts[id2]).add(verts[id3]).multiplyScalar(0.25);

		let minT = Number.POSITIVE_INFINITY;
		let minFaceNr = -1;
		for (let j = 0; j < 4; j++) {
			const n = planesN[4 * tetNr + j];
			const d = planesD[4 * tetNr + j];

			const hp = n.dot(vertPos) - d;
			const hc = n.dot(_center) - d;

			let t = hp - hc;
			if (t == 0) {
				continue;
			}

			// time when c -> p hits the face
			t = -hc / t;

			if (t >= 0.0 && t < minT) {
				minT = t;
				minFaceNr = j;
			}
		}
		if (minT >= 1.0) {
			found = true;
		} else {
			tetNr = neighbors[4 * tetNr + minFaceNr];
		}
	}
	return {found, tetNr};
}
