import {TET_FACE_OPPOSITE_POINT_INDICES, TET_FACE_POINT_INDICES} from '../TetCommon';
import {TetGeometry} from '../TetGeometry';
import {Triangle, Plane, Vector3} from 'three';
// import {tetCenter} from './tetCenter';

const _triangle = new Triangle();
const _plane = new Plane();
const _oppositePt = new Vector3();
const _v = new Vector3();
const _delta = new Vector3();
const _newPt = new Vector3();
// const _center = new Vector3();
// const _line = new Line3();

export function tetMirrorOnPlane(tetGeometry: TetGeometry, tetId: number, faceIndex: number, scale: number) {
	const {tetrahedrons, points} = tetGeometry;
	const tet = tetrahedrons.get(tetId);
	if (!tet) {
		return;
	}
	const facePointIndices = TET_FACE_POINT_INDICES[faceIndex];
	const id0 = tet.pointIds[facePointIndices[0]];
	const id1 = tet.pointIds[facePointIndices[1]];
	const id2 = tet.pointIds[facePointIndices[2]];
	const oppositeId = tet.pointIds[TET_FACE_OPPOSITE_POINT_INDICES[faceIndex]];
	const pt0 = points.get(id0);
	const pt1 = points.get(id1);
	const pt2 = points.get(id2);
	const ptOpposite = points.get(oppositeId);
	if (!(pt0 && pt1 && pt2 && ptOpposite)) {
		return;
	}
	_triangle.a.copy(pt0.position);
	_triangle.b.copy(pt1.position);
	_triangle.c.copy(pt2.position);
	_oppositePt.copy(ptOpposite.position);
	_triangle.getPlane(_plane);
	_plane.projectPoint(_oppositePt, _v);
	_delta.copy(_oppositePt).sub(_v).multiplyScalar(scale);
	_newPt.copy(_v).sub(_delta);

	const index3 = tetGeometry.addPoint(_newPt.x, _newPt.y, _newPt.z);
	tetGeometry.addTetrahedron(index3, id2, id1, id0);
}

// export function tetMirrorOnCenter(tetGeometry: TetGeometry, tetIndex: number, faceIndex: number, scale: number) {
// 	const {tetrahedrons, points} = tetGeometry;
// 	tetCenter(tetGeometry, tetIndex, _center);
// 	const tet = tetrahedrons[tetIndex];
// 	const facePointIndices = TET_FACE_POINT_INDICES[faceIndex];
// 	const index0 = tet[facePointIndices[0]];
// 	const index1 = tet[facePointIndices[1]];
// 	const index2 = tet[facePointIndices[2]];

// 	_oppositePt.copy(points[tet[TET_FACE_OPPOSITE_POINT_INDICES[faceIndex]]]);
// 	_plane.setFromCoplanarPoints(points[index0], points[index1], points[index2]);
// 	_line.start.copy(_center);
// 	_line.end.copy(_oppositePt);
// 	_plane.intersectLine(_line, _v);

// 	_delta.copy(_oppositePt).sub(_v).multiplyScalar(scale);
// 	_newPt.copy(_v).sub(_delta);

// 	const index3 = tetGeometry.addPoint(_newPt.x, _newPt.y, _newPt.z);
// 	tetGeometry.addTetrahedron(index3, index2, index1, index0);
// }
