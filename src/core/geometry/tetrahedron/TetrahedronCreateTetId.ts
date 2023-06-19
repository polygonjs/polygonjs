// import {Matrix4, Vector3} from 'three';
// import {TetCreationStage, TetEdge} from './TetrahedronConstant';
// import {MeshWithBVHGeometry} from '../bvh/ThreeMeshBVHHelper';

// import {_findContainingTet} from './utils/TetIdFindContainingTet';
// import {_visitNeighbours} from './utils/TetIdVisitNeighbours';
// import {_fixNeighbours} from './utils/TetIdFixNeighbours';
// import {_removeOutsideTets} from './utils/TetIdRemoveOutsideTets';
// import {_findViolatingTets} from './utils/TetIdFindViolatingTets';
// import {TET_FACE_POINT_INDICES} from '../tet/TetCommon';

// const _p = new Vector3();
// const _p0 = new Vector3();
// const _p1 = new Vector3();
// const _p2 = new Vector3();
// const _center = new Vector3();

// interface CreateTetIdsOptions {
// 	invMat: Matrix4;
// 	mesh: MeshWithBVHGeometry;
// 	verts: Vector3[];
// 	minQuality: number;
// 	//
// 	stage: TetCreationStage;
// 	subStage: number;
// 	removeOutsideTets: boolean;
// }
// interface CreateTetIdsResult {
// 	tetIds: number[];
// }

// export function createTetIds(options: CreateTetIdsOptions): CreateTetIdsResult {
// 	const {invMat, mesh, verts, minQuality, stage, subStage, removeOutsideTets} = options;
// 	const tetIds: number[] = [];
// 	const neighbors: number[] = [];
// 	const tetMarks = [];

// 	let tetMark: number = 0;
// 	let firstFreeTet: number = -1;

// 	const planesN: Vector3[] = [];
// 	const planesD: number[] = [];

// 	const firstBig = verts.length - 4;

// 	// first big tet
// 	tetIds.push(firstBig);
// 	tetIds.push(firstBig + 1);
// 	tetIds.push(firstBig + 2);
// 	tetIds.push(firstBig + 3);
// 	if (stage == TetCreationStage.TETS && subStage == 0) {
// 		return {tetIds};
// 	}

// 	tetMarks.push(0);

// 	// for i in range(4):
// 	//     neighbors.append(-1)
// 	//     p0 = verts[firstBig + tetFaces[i][0]]
// 	//     p1 = verts[firstBig + tetFaces[i][1]]
// 	//     p2 = verts[firstBig + tetFaces[i][2]]
// 	//     n = (p1 - p0).cross(p2 - p0)
// 	//     n.normalize()
// 	//     planesN.append(n)
// 	//     planesD.append(p0.dot(n))
// 	for (let i = 0; i < 4; i++) {
// 		neighbors.push(-1);
// 		_p0.copy(verts[firstBig + TET_FACE_POINT_INDICES[i][0]]);
// 		_p1.copy(verts[firstBig + TET_FACE_POINT_INDICES[i][1]]);
// 		_p2.copy(verts[firstBig + TET_FACE_POINT_INDICES[i][2]]);
// 		_p1.sub(_p0);
// 		_p2.sub(_p0);
// 		const n = new Vector3().copy(_p1).cross(_p2);
// 		n.normalize();
// 		planesN.push(n);
// 		planesD.push(_p0.dot(n));
// 	}

// 	_center.set(0.0, 0.0, 0.0);

// 	console.warn(' ------------- tetrahedralization ------------------- ');

// 	for (let i = 0; i < firstBig; i++) {
// 		if (i > subStage) {
// 			break;
// 		}
// 		_p.copy(verts[i]);
// 		// if (i % 100 == 0) {
// 		console.log('inserting vert', i, 'of', firstBig);
// 		// }
// 		// find non-deleted tet
// 		let tetNr: number = 0;
// 		while (tetIds[4 * tetNr] < 0) {
// 			tetNr++;
// 		}

// 		// find containing tet
// 		tetMark++;
// 		const result = _findContainingTet({
// 			vertPos: _p,
// 			tetIds,
// 			tetMarks,
// 			tetMark,
// 			verts,
// 			tetNr,
// 			neighbors,
// 			planesN,
// 			planesD,
// 		});
// 		tetNr = result.tetNr;
// 		if (!result.found) {
// 			console.warn(`*********** failed to insert vertex '${i}'`);
// 			continue;
// 		}

// 		// find violating tets

// 		tetMark++;
// 		// const violatingTets: number[] = [];
// 		// let stack = [tetNr];

// 		// while (stack.length != 0) {
// 		// 	tetNr = stack.pop()!;
// 		// 	if (tetMarks[tetNr] == tetMark) {
// 		// 		continue;
// 		// 	}
// 		// 	tetMarks[tetNr] = tetMark;
// 		// 	violatingTets.push(tetNr);

// 		// 	for (let j = 0; j < 4; j++) {
// 		// 		const n = neighbors[4 * tetNr + j];
// 		// 		if (n < 0 || tetMarks[n] == tetMark) {
// 		// 			continue;
// 		// 		}
// 		// 		// Delaunay condition test
// 		// 		const id0 = tetIds[4 * n];
// 		// 		const id1 = tetIds[4 * n + 1];
// 		// 		const id2 = tetIds[4 * n + 2];
// 		// 		const id3 = tetIds[4 * n + 3];

// 		// 		getCircumCenter(verts[id0], verts[id1], verts[id2], verts[id3], _c);

// 		// 		const r = _v3.copy(verts[id0]).sub(_c).length();
// 		// 		if (_v3.copy(_p).sub(_c).length() < r) {
// 		// 			stack.push(n);
// 		// 		}
// 		// 	}
// 		// }
// 		const violatingTestsResult = _findViolatingTets({
// 			vertPos: _p,
// 			tetIds,
// 			tetMarks,
// 			tetMark,
// 			verts,
// 			tetNr,
// 			neighbors,
// 		});
// 		const violatingTets = violatingTestsResult.violatingTets;
// 		tetNr = violatingTestsResult.tetNr;

// 		// remove old tets, create new ones

// 		const edges: TetEdge[] = [];
// 		const violatingTetsCount = violatingTets.length;
// 		for (let j = 0; j < violatingTetsCount; j++) {
// 			tetNr = violatingTets[j];
// 			const ids = [0, 0, 0, 0];
// 			const ns = [0, 0, 0, 0];
// 			for (let k = 0; k < 4; k++) {
// 				ids[k] = tetIds[4 * tetNr + k];
// 				ns[k] = neighbors[4 * tetNr + k];
// 			}
// 			// delete the tet
// 			tetIds[4 * tetNr] = -1;
// 			tetIds[4 * tetNr + 1] = firstFreeTet;
// 			firstFreeTet = tetNr;

// 			// visit neighbors
// 			const result = _visitNeighbours({
// 				tetMarks,
// 				tetMark,
// 				tetIds,
// 				tetNr,
// 				edges,
// 				neighbors,
// 				ns,
// 				firstFreeTet,
// 				verts,
// 				planesN,
// 				planesD,
// 				ids,
// 				i,
// 			});
// 			firstFreeTet = result.firstFreeTet;

// 			// next neighbor

// 			// next violating tet

// 			// fix neighbors

// 			_fixNeighbours({edges, neighbors});
// 		}

// 		// next point
// 	}
// 	// remove outer, deleted and outside tets

// 	const newTetIds = removeOutsideTets
// 		? _removeOutsideTets({
// 				invMat,
// 				mesh,
// 				tetIds,
// 				firstBig,
// 				verts,
// 				minQuality,
// 		  })
// 		: tetIds;

// 	console.warn(Math.floor(newTetIds.length / 4), 'tets created');

// 	return {tetIds: newTetIds};
// }
