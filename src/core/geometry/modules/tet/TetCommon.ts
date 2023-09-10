// export type TetGeometry = any;

import {Vector3} from 'three';
import {Number3, Number4} from '../../../../types/GlobalTypes';

export type String3 = [string, string, string];
export interface TetNeighbourData {
	id: number;
	faceIndex: number;
}
type TetPointIds = Number4;

export type TetNeighbourDataOrNull = TetNeighbourData | null;
export type TetNeighbourDatas = [
	TetNeighbourDataOrNull,
	TetNeighbourDataOrNull,
	TetNeighbourDataOrNull,
	TetNeighbourDataOrNull
];
export interface TetNeighbourDataWithSource {
	// faceIndex: number;
	pointIds: Number3;
	// tetPointIds: TetPointIds;
	// faceIndex: number;
	// neighbourData: TetNeighbourDataOrNull;
}
export interface TetrahedronPoint {
	id: number;
	position: Vector3;
}
export interface TetrahedronSphere {
	center: Vector3;
	radius: number;
}
export interface Tetrahedron {
	id: number;
	pointIds: TetPointIds;
	neighbours: TetNeighbourDatas;
	sphere: TetrahedronSphere;
	disposed: boolean;
}
export interface TetTesselationParams {
	scale: number;
	displayOuterMesh: boolean;
	displayTetMesh: boolean;
	displayLines: boolean;
	displaySharedFaces: boolean;
	displayPoints: boolean;
	displayCenter: boolean;
	displaySphere: boolean;
}
export interface TetOBJTesselationParams {
	TetScale: number;
	TetDisplayOuterMesh: boolean;
	TetDisplayTetMesh: boolean;
	TetDisplayLines: boolean;
	TetDisplaySharedFaces: boolean;
	TetDisplayPoints: boolean;
	TetDisplayCenter: boolean;
	TetDisplaySphere: boolean;
}

type Number3_4 = [Number3, Number3, Number3, Number3];
type Vector3_4 = [Vector3, Vector3, Vector3, Vector3];
export const TET_FACE_POINT_INDICES: Number3_4 = [
	[2, 1, 0],
	[0, 1, 3],
	[1, 2, 3],
	[2, 0, 3],
];
export const TET_FACE_OPPOSITE_POINT_INDICES: Number4 = [3, 2, 0, 1];
export const TET_VERTICES_BASE: Number3_4 = [
	[1, 1, 1],
	[-1, -1, 1],
	[-1, 1, -1],
	[1, -1, -1],
];

export const TET_VERTICES0: Number3_4 = [
	[-1, 0, -1],
	[1, 0, -1],
	[0, 1, 1],
	[0, -1, 1],
];
export const TET_VERTICES1: Number3_4 = [
	[0, 0, -1],
	[-1, 1, 1],
	[-1, -1, 1],
	[1, 0, 1],
];
export const TET_VERTICES2: Number3_4 = [
	[-1, 0, -1],
	[0, 0, 1],
	[1, -1, -1],
	[1, 1, -1],
];
export const TET_VERTICES3: Number3_4 = [
	[0, 1, -1],
	[0, -1, -1],
	[1, 0, 1],
	[-1, 0, 1],
];
export const TET_VERTICES4: Number3_4 = [
	[-1, -1, -1],
	[-1, 1, -1],
	[0, 0, 1],
	[1, 0, -1],
];
export const TET_VERTICES5: Number3_4 = [
	[-1, 0, 1],
	[0, 0, -1],
	[1, 1, 1],
	[1, -1, 1],
];
// Y
export const TET_VERTICES6: Number3_4 = [
	[-1, -1, -1],
	[1, -1, -1],
	[0, 1, -1],
	[0, 0, 1],
];
export const TET_VERTICES7: Number3_4 = [
	[0, -1, 1],
	[0, 0, -1],
	[-1, 1, 1],
	[1, 1, 1],
];
export const TET_VERTICES8: Number3_4 = [
	[0, 0, -1],
	[0, 1, 1],
	[-1, -1, 1],
	[1, -1, 1],
];
export const TET_VERTICES9: Number3_4 = [
	[0, 0, 1],
	[0, -1, -1],
	[-1, 1, -1],
	[1, 1, -1],
];

function _toVectors(a: Number3_4) {
	return a.map((v) => new Vector3().fromArray(v)) as Vector3_4;
}
export const TET_VERTICES_V_BASE: Vector3_4 = _toVectors(TET_VERTICES_BASE);
export const TET_VERTICES_V0: Vector3_4 = _toVectors(TET_VERTICES0);
export const TET_VERTICES_V1: Vector3_4 = _toVectors(TET_VERTICES1);
export const TET_VERTICES_V2: Vector3_4 = _toVectors(TET_VERTICES2);
export const TET_VERTICES_V3: Vector3_4 = _toVectors(TET_VERTICES3);
export const TET_VERTICES_V4: Vector3_4 = _toVectors(TET_VERTICES4);
export const TET_VERTICES_V5: Vector3_4 = _toVectors(TET_VERTICES5);
export const TET_VERTICES_V6: Vector3_4 = _toVectors(TET_VERTICES6);
export const TET_VERTICES_V7: Vector3_4 = _toVectors(TET_VERTICES7);
export const TET_VERTICES_V8: Vector3_4 = _toVectors(TET_VERTICES8);
export const TET_VERTICES_V9: Vector3_4 = _toVectors(TET_VERTICES9);

export const VERTICES_X = [
	TET_VERTICES_V0,
	TET_VERTICES_V1,
	TET_VERTICES_V2,
	TET_VERTICES_V3,
	TET_VERTICES_V4,
	TET_VERTICES_V5,
];
export const VERTICES_Y = [
	TET_VERTICES_V0,
	TET_VERTICES_V6,
	TET_VERTICES_V7,
	TET_VERTICES_V3,
	TET_VERTICES_V8,
	TET_VERTICES_V9,
];
