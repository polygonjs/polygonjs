import {TET_FACE_POINT_INDICES} from '../TetCommon';
import {TetGeometry} from '../TetGeometry';
import {Triangle} from 'three';

export function tetFaceTriangle(tetGeometry: TetGeometry, tetId: number, faceIndex: number, target: Triangle) {
	const tetrahedron = tetGeometry.tetrahedrons.get(tetId);
	if (!tetrahedron) {
		return;
	}

	const facePointIndices = TET_FACE_POINT_INDICES[faceIndex];
	const id0 = tetrahedron.pointIds[facePointIndices[0]];
	const id1 = tetrahedron.pointIds[facePointIndices[1]];
	const id2 = tetrahedron.pointIds[facePointIndices[2]];
	const pt0 = tetGeometry.points.get(id0);
	const pt1 = tetGeometry.points.get(id1);
	const pt2 = tetGeometry.points.get(id2);
	if (!(pt0 && pt1 && pt2)) {
		return;
	}
	target.a.copy(pt0.position);
	target.b.copy(pt1.position);
	target.c.copy(pt2.position);
}
