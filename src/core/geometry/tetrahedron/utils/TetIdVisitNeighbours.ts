import {Vector3} from 'three';
import {TetEdge} from '../TetrahedronConstant';
import {TET_FACE_POINT_INDICES} from '../../tet/TetCommon';

const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();

interface VisitNeighboursOptions {
	tetMarks: number[];
	tetMark: number;
	tetIds: number[];
	tetNr: number;
	edges: TetEdge[];
	neighbors: number[];
	ns: number[];
	firstFreeTet: number;
	verts: Vector3[];
	planesN: Vector3[];
	planesD: number[];
	ids: number[];
	i: number;
}
interface VisitNeighboursResult {
	firstFreeTet: number;
}
export function _visitNeighbours(options: VisitNeighboursOptions): VisitNeighboursResult {
	const {tetMark, tetMarks, tetIds, tetNr, edges, neighbors, ns, verts, planesN, planesD, ids, i} = options;
	let {firstFreeTet} = options;
	for (let k = 0; k < 4; k++) {
		const n = ns[k];
		if (n >= 0 && tetMarks[n] == tetMark) {
			continue;
		}

		// no neighbor or neighbor is not-violating -> we are facing the border

		// create new tet

		let newTetNr = firstFreeTet;

		if (newTetNr >= 0) {
			firstFreeTet = tetIds[4 * firstFreeTet + 1];
		} else {
			newTetNr = Math.floor(tetIds.length / 4);
			tetMarks.push(0);
			for (let l = 0; l < 4; l++) {
				tetIds.push(-1);
				neighbors.push(-1);
				planesN.push(new Vector3(0.0, 0.0, 0.0));
				planesD.push(0.0);
			}
		}
		const id0 = ids[TET_FACE_POINT_INDICES[k][2]];
		const id1 = ids[TET_FACE_POINT_INDICES[k][1]];
		const id2 = ids[TET_FACE_POINT_INDICES[k][0]];

		tetIds[4 * newTetNr] = id0;
		tetIds[4 * newTetNr + 1] = id1;
		tetIds[4 * newTetNr + 2] = id2;
		tetIds[4 * newTetNr + 3] = i;

		neighbors[4 * newTetNr] = n;

		if (n >= 0) {
			for (let l = 0; l < 4; l++) {
				if (neighbors[4 * n + l] == tetNr) {
					neighbors[4 * n + l] = newTetNr;
				}
			}
		}

		// will set the neighbors among the new tets later

		neighbors[4 * newTetNr + 1] = -1;
		neighbors[4 * newTetNr + 2] = -1;
		neighbors[4 * newTetNr + 3] = -1;

		for (let l = 0; l < 4; l++) {
			_p0.copy(verts[tetIds[4 * newTetNr + TET_FACE_POINT_INDICES[l][0]]]);
			_p1.copy(verts[tetIds[4 * newTetNr + TET_FACE_POINT_INDICES[l][1]]]);
			_p2.copy(verts[tetIds[4 * newTetNr + TET_FACE_POINT_INDICES[l][2]]]);
			_p1.sub(_p0);
			_p2.sub(_p0);
			const newN = new Vector3().copy(_p1).cross(_p2);
			newN.normalize();
			planesN[4 * newTetNr + l] = newN;
			planesD[4 * newTetNr + l] = newN.dot(_p0);
		}

		if (id0 < id1) {
			edges.push([id0, id1, newTetNr, 1]);
		} else {
			edges.push([id1, id0, newTetNr, 1]);
		}

		if (id1 < id2) {
			edges.push([id1, id2, newTetNr, 2]);
		} else {
			edges.push([id2, id1, newTetNr, 2]);
		}

		if (id2 < id0) {
			edges.push([id2, id0, newTetNr, 3]);
		} else {
			edges.push([id0, id2, newTetNr, 3]);
		}
	}
	return {
		firstFreeTet,
	};
}
