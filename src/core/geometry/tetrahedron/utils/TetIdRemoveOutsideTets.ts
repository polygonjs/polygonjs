// import {Matrix4, Vector3} from 'three';
// import {IsInsideOptions, isInside, tetQuality} from '../TetrahedronUtils';
// import {MeshWithBVHGeometry} from '../../bvh/ThreeMeshBVHHelper';

// const _center = new Vector3();

// interface RemoveOutsideTetsOptions {
// 	invMat: Matrix4;
// 	mesh: MeshWithBVHGeometry;
// 	tetIds: number[];
// 	firstBig: number;
// 	verts: Vector3[];
// 	minQuality: number;
// }

// export function _removeOutsideTets(options: RemoveOutsideTetsOptions) {
// 	const {invMat, mesh, tetIds, firstBig, verts, minQuality} = options;
// 	const isInsideOptions: IsInsideOptions = {
// 		invMat,
// 		mesh,
// 		p: new Vector3(),
// 		minDist: 0,
// 	};
// 	const newTetIds: number[] = [];

// 	const numTets = Math.floor(tetIds.length) / 4;
// 	let num = 0;
// 	let numBad = 0;
// 	for (let i = 0; i < numTets; i++) {
// 		const id0 = tetIds[4 * i];
// 		const id1 = tetIds[4 * i + 1];
// 		const id2 = tetIds[4 * i + 2];
// 		const id3 = tetIds[4 * i + 3];

// 		if (id0 < 0 || id0 >= firstBig || id1 >= firstBig || id2 >= firstBig || id3 >= firstBig) {
// 			continue;
// 		}

// 		const p0 = verts[id0];
// 		const p1 = verts[id1];
// 		const p2 = verts[id2];
// 		const p3 = verts[id3];

// 		const quality = tetQuality(p0, p1, p2, p3);

// 		if (quality < minQuality) {
// 			numBad = numBad + 1;
// 			continue;
// 		}

// 		_center.copy(p0).add(p1).add(p2).add(p3).multiplyScalar(0.25);

// 		isInsideOptions.p.copy(_center);
// 		if (!isInside(isInsideOptions)) {
// 			continue;
// 		}

// 		newTetIds[num] = id0;
// 		num = num + 1;
// 		newTetIds[num] = id1;
// 		num = num + 1;
// 		newTetIds[num] = id2;
// 		num = num + 1;
// 		newTetIds[num] = id3;
// 		num = num + 1;
// 	}
// 	// console.log('presplice', [...tetIds]);
// 	// tetIds.splice(num);
// 	// console.log('postsplice', [...tetIds]);

// 	console.warn(numBad, 'bad tets deleted');
// 	return newTetIds;
// }
