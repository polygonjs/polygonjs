// import {Number3} from '../../../../types/GlobalTypes';
// import {TET_FACE_OPPOSITE_POINT_INDICES, TET_FACE_POINT_INDICES} from '../TetCommon';
// import {TetGeometry} from '../TetGeometry';
// import {tetsSharedFace} from './tetSharedFace';

// export function tetPairRotate(tetGeometry: TetGeometry, tetId0: number, tetId1: number) {
// 	const tet0 = tetGeometry.tetrahedrons.get(tetId0);
// 	const tet1 = tetGeometry.tetrahedrons.get(tetId1);
// 	if (!tet0 || !tet1) {
// 		return;
// 	}

// 	const sharedFaceData = tetsSharedFace(tetGeometry, tetId0, tetId1);
// 	if (!sharedFaceData) {
// 		console.log('A');
// 		return;
// 	}

// 	const oppositePoint0 = TET_FACE_OPPOSITE_POINT_INDICES[sharedFaceData.faceIndex0];
// 	const oppositePoint1 = TET_FACE_OPPOSITE_POINT_INDICES[sharedFaceData.faceIndex1];
// 	console.log(sharedFaceData, oppositePoint0, oppositePoint1);

// 	// create a tetrahidral fan from one of the opposite points,
// 	// to the faces that are
// 	// - connected to the other opposite point
// 	// - are not in the current tetrahedron

// 	const srcPt = tet0.pointIds[oppositePoint0];
// 	const dstPt = tet1.pointIds[oppositePoint1];
// 	console.log({srcPt, dstPt});

// 	let selectedFaceIndices: Number3 | undefined;
// 	for (let faceIndices of TET_FACE_POINT_INDICES) {
// 		if (faceIndices.includes(srcPt) && faceIndices.includes(dstPt)) {
// 			selectedFaceIndices = faceIndices;
// 			break;
// 		}
// 	}

// 	// remove tets
// 	// tetGeometry.removeTets([tetId0, tetId1]);

// 	// add tets
// 	if (!selectedFaceIndices) {
// 		console.log('B');
// 		return;
// 	}
// 	const pt0 = tet0.pointIds[selectedFaceIndices[0]];
// 	const pt1 = tet0.pointIds[selectedFaceIndices[1]];
// 	const pt2 = tet0.pointIds[selectedFaceIndices[2]];
// 	if (pt0 != null || pt1 != null || pt2 != null) {
// 		tetGeometry.addTetrahedron(pt0, pt1, pt2, srcPt);
// 		tetGeometry.addTetrahedron(pt0, pt1, dstPt, pt2);
// 	}
// 	// tetGeometry.addTetrahedron([tet1.pointIds[selectedFaceIndices[0]], tet1.pointIds[selectedFaceIndices[1]], srcPt, dstPt]);
// }
