import {Matrix4, Vector3} from 'three';
import {TET_FACES, TetCreationStage, TetEdge} from './TetrahedronConstant';
import {IsInsideOptions, compareEdges, equalEdges, getCircumCenter, isInside, tetQuality} from './TetrahedronUtils';
import {MeshWithBVHGeometry} from '../bvh/ThreeMeshBVHHelper';

const p = new Vector3();
const p0 = new Vector3();
const p1 = new Vector3();
const p2 = new Vector3();
const c = new Vector3();
const center = new Vector3();
const _v3 = new Vector3();

interface CreateTetIdsOptions {
	invMat: Matrix4;
	mesh: MeshWithBVHGeometry;
	verts: Vector3[];
	minQuality: number;
	//
	stage: TetCreationStage;
	subStage: number;
}
interface CreateTetIdsResult {
	tetIds: number[];
}

export function createTetIds(options: CreateTetIdsOptions): CreateTetIdsResult {
	const {invMat, mesh, verts, minQuality, stage, subStage} = options;
	const tetIds: number[] = [];
	const neighbors: number[] = [];
	const tetMarks = [];

	let tetMark: number = 0;
	let firstFreeTet: number = -1;

	const planesN: Vector3[] = [];
	const planesD: number[] = [];

	const firstBig = verts.length - 4;

	// first big tet
	tetIds.push(firstBig);
	tetIds.push(firstBig + 1);
	tetIds.push(firstBig + 2);
	tetIds.push(firstBig + 3);
	if (stage == TetCreationStage.TETS && subStage == 0) {
		return {tetIds};
	}

	tetMarks.push(0);

	// for i in range(4):
	//     neighbors.append(-1)
	//     p0 = verts[firstBig + tetFaces[i][0]]
	//     p1 = verts[firstBig + tetFaces[i][1]]
	//     p2 = verts[firstBig + tetFaces[i][2]]
	//     n = (p1 - p0).cross(p2 - p0)
	//     n.normalize()
	//     planesN.append(n)
	//     planesD.append(p0.dot(n))
	for (let i = 0; i < 4; i++) {
		neighbors.push(-1);
		p0.copy(verts[firstBig + TET_FACES[i][0]]);
		p1.copy(verts[firstBig + TET_FACES[i][1]]);
		p2.copy(verts[firstBig + TET_FACES[i][2]]);
		p1.sub(p0);
		p2.sub(p0);
		const n = new Vector3().copy(p1).cross(p2);
		n.normalize();
		planesN.push(n);
		planesD.push(p0.dot(n));
	}

	center.set(0.0, 0.0, 0.0);

	console.warn(' ------------- tetrahedralization ------------------- ');

	for (let i = 0; i < firstBig; i++) {
		p.copy(verts[i]);
		// if (i % 100 == 0) {
		console.log('inserting vert', i + 1, 'of', firstBig);
		// }
		// find non-deleted tet
		let tetNr: number = 0;
		while (tetIds[4 * tetNr] < 0) {
			tetNr++;
		}

		// find containing tet
		tetMark++;
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

			center.copy(verts[id0]).add(verts[id1]).add(verts[id2]).add(verts[id3]).multiplyScalar(0.25);

			let minT = Number.POSITIVE_INFINITY;
			let minFaceNr = -1;
			for (let j = 0; j < 4; j++) {
				const n = planesN[4 * tetNr + j];
				const d = planesD[4 * tetNr + j];

				const hp = n.dot(p) - d;
				const hc = n.dot(center) - d;

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
		if (!found) {
			console.warn(`*********** failed to insert vertex '${i}'`);
			continue;
		}

		// find violating tets

		tetMark++;
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

				getCircumCenter(verts[id0], verts[id1], verts[id2], verts[id3], c);

				const r = _v3.copy(verts[id0]).sub(c).length();
				if (_v3.copy(p).sub(c).length() < r) {
					stack.push(n);
				}
			}
		}

		// remove old tets, create new ones

		const edges: TetEdge[] = [];
		const violatingTetsCount = violatingTets.length;
		for (let j = 0; j < violatingTetsCount; j++) {
			tetNr = violatingTets[j];
			const ids = [0, 0, 0, 0];
			const ns = [0, 0, 0, 0];
			for (let k = 0; k < 4; k++) {
				ids[k] = tetIds[4 * tetNr + k];
				ns[k] = neighbors[4 * tetNr + k];
			}
			// delete the tet
			tetIds[4 * tetNr] = -1;
			tetIds[4 * tetNr + 1] = firstFreeTet;
			firstFreeTet = tetNr;

			// visit neighbors
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
				const id0 = ids[TET_FACES[k][2]];
				const id1 = ids[TET_FACES[k][1]];
				const id2 = ids[TET_FACES[k][0]];

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
					p0.copy(verts[tetIds[4 * newTetNr + TET_FACES[l][0]]]);
					p1.copy(verts[tetIds[4 * newTetNr + TET_FACES[l][1]]]);
					p2.copy(verts[tetIds[4 * newTetNr + TET_FACES[l][2]]]);
					const newN = new Vector3().copy(p1.sub(p0)).cross(p2.sub(p0));
					newN.normalize();
					planesN[4 * newTetNr + l] = newN;
					planesD[4 * newTetNr + l] = newN.dot(p0);
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

			// next neighbor

			// next violating tet

			// fix neighbors

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

		// next point
	}
	// remove outer, deleted and outside tets

	const isInsideOptions: IsInsideOptions = {
		invMat,
		mesh,
		p: new Vector3(),
		minDist: 0,
	};

	const numTets = Math.floor(tetIds.length) / 4;
	let num = 0;
	let numBad = 0;
	for (let i = 0; i < numTets; i++) {
		const id0 = tetIds[4 * i];
		const id1 = tetIds[4 * i + 1];
		const id2 = tetIds[4 * i + 2];
		const id3 = tetIds[4 * i + 3];

		if (id0 < 0 || id0 >= firstBig || id1 >= firstBig || id2 >= firstBig || id3 >= firstBig) {
			continue;
		}

		const p0 = verts[id0];
		const p1 = verts[id1];
		const p2 = verts[id2];
		const p3 = verts[id3];

		const quality = tetQuality(p0, p1, p2, p3);

		if (quality < minQuality) {
			numBad = numBad + 1;
			continue;
		}

		center.copy(p0).add(p1).add(p2).add(p3).multiplyScalar(0.25);

		isInsideOptions.p = center;
		if (!isInside(isInsideOptions)) {
			continue;
		}

		tetIds[num] = id0;
		num = num + 1;
		tetIds[num] = id1;
		num = num + 1;
		tetIds[num] = id2;
		num = num + 1;
		tetIds[num] = id3;
		num = num + 1;
	}

	tetIds.splice(0, num);

	console.warn(numBad, 'bad tets deleted');
	console.warn(Math.floor(tetIds.length / 4), 'tets created');

	return {tetIds};
}
