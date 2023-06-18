import {TET_FACE_OPPOSITE_POINT_INDICES, TET_FACE_POINT_INDICES} from '../TetCommon';
import {TetGeometry} from '../TetGeometry';
import {Triangle, Plane, Vector3, Line3} from 'three';
import {tetCenter} from './tetCenter';

const _triangle = new Triangle();
const _plane = new Plane();
const _oppositePt = new Vector3();
const _v = new Vector3();
const _delta = new Vector3();
const _newPt = new Vector3();
const _center = new Vector3();
const _line = new Line3();

export function tetMirrorOnPlane(tetGeometry: TetGeometry, tetIndex: number, faceIndex: number, scale: number) {
	const {tetrahedrons, points} = tetGeometry;
	const tet = tetrahedrons[tetIndex];
	const facePointIndices = TET_FACE_POINT_INDICES[faceIndex];
	const index0 = tet[facePointIndices[0]];
	const index1 = tet[facePointIndices[1]];
	const index2 = tet[facePointIndices[2]];
	_triangle.a.copy(points[index0]);
	_triangle.b.copy(points[index1]);
	_triangle.c.copy(points[index2]);
	_oppositePt.copy(points[tet[TET_FACE_OPPOSITE_POINT_INDICES[faceIndex]]]);
	_triangle.getPlane(_plane);
	_plane.projectPoint(_oppositePt, _v);
	_delta.copy(_oppositePt).sub(_v).multiplyScalar(scale);
	_newPt.copy(_v).sub(_delta);

	const index3 = tetGeometry.addPoint(_newPt.x, _newPt.y, _newPt.z);
	tetGeometry.addTetrahedron(index3, index2, index1, index0);
}

export function tetMirrorOnCenter(tetGeometry: TetGeometry, tetIndex: number, faceIndex: number, scale: number) {
	const {tetrahedrons, points} = tetGeometry;
	tetCenter(tetGeometry, tetIndex, _center);
	const tet = tetrahedrons[tetIndex];
	const facePointIndices = TET_FACE_POINT_INDICES[faceIndex];
	const index0 = tet[facePointIndices[0]];
	const index1 = tet[facePointIndices[1]];
	const index2 = tet[facePointIndices[2]];

	_oppositePt.copy(points[tet[TET_FACE_OPPOSITE_POINT_INDICES[faceIndex]]]);
	_plane.setFromCoplanarPoints(points[index0], points[index1], points[index2]);
	_line.start.copy(_center);
	_line.end.copy(_oppositePt);
	_plane.intersectLine(_line, _v);

	_delta.copy(_oppositePt).sub(_v).multiplyScalar(scale);
	_newPt.copy(_v).sub(_delta);

	const index3 = tetGeometry.addPoint(_newPt.x, _newPt.y, _newPt.z);
	tetGeometry.addTetrahedron(index3, index2, index1, index0);
}
