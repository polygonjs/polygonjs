import {Vector3} from 'three';
import {getCircumCenter} from '../TetrahedronUtils';

const _v3 = new Vector3();
const _c = new Vector3();

interface FindViolatingTetsOptions {
	vertPos: Vector3;
	tetNr: number;
	tetMarks: number[];
	tetMark: number;
	neighbors: number[];
	tetIds: number[];
	verts: Vector3[];
}
interface FindViolatingTetsResult {
	violatingTets: number[];
	tetNr: number;
}

export function _findViolatingTets(options: FindViolatingTetsOptions): FindViolatingTetsResult {
	const {tetIds, tetMarks, tetMark, neighbors, verts, vertPos} = options;
	let {tetNr} = options;
	const violatingTets: number[] = [];
	let stack = [tetNr];

	while (stack.length != 0) {
		tetNr = stack.pop()!;
		if (tetMarks[tetNr] == tetMark) {
			continue;
		}
		tetMarks[tetNr] = tetMark;
		violatingTets.push(tetNr);

		for (let j = 0; j < 4; j++) {
			const n = neighbors[4 * tetNr + j];
			if (n < 0 || tetMarks[n] == tetMark) {
				continue;
			}
			// Delaunay condition test
			const id0 = tetIds[4 * n];
			const id1 = tetIds[4 * n + 1];
			const id2 = tetIds[4 * n + 2];
			const id3 = tetIds[4 * n + 3];

			getCircumCenter(verts[id0], verts[id1], verts[id2], verts[id3], _c);

			const r = _v3.copy(verts[id0]).sub(_c).length();
			if (_v3.copy(vertPos).sub(_c).length() < r) {
				stack.push(n);
			}
		}
	}
	return {violatingTets, tetNr};
}
