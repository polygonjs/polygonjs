import {FrontSide, LineBasicMaterial, MeshStandardMaterial, PointsMaterial, Color} from 'three';
// import {ObjectType} from '../Constant';
// import {CsgObjectType} from './CsgToObject3D';

// export interface CsgObjectData {
// 	type: CsgObjectType;
// }
export const step = 0.000001;

// interface MaterialPair<M extends Material> {
// 	plain: M;
// 	wireframe: M;
// }
const GROUP_COLOR = 0x11dd00;
const MESH_MAT = new MeshStandardMaterial({
	color: 0xffffff,
	// vertexColors: true,
	side: FrontSide,
	metalness: 0.0,
	roughness: 0.9,
});
const MESH_GROUP_MAT = new MeshStandardMaterial({
	color: GROUP_COLOR,
	// vertexColors: true,
	side: FrontSide,
	metalness: 0.0,
	roughness: 0.9,
	emissive: 0.5,
});
// const MESH_MAT_WIREFRAME = (() => {
// 	const mat = MESH_MAT.clone();
// 	mat.wireframe = true;
// 	return mat;
// })();
const LINES_MAT = new LineBasicMaterial({
	color: 0xffffff,
	linewidth: 1,
});
const LINES_GROUP_MAT = new LineBasicMaterial({
	color: GROUP_COLOR,
	linewidth: 5,
	// depthWrite: false,
});
const POINTS_MAT = new PointsMaterial({
	color: 0xffffff,
	size: 0.1,
});

// interface CadMaterial {
// 	[ObjectType.MESH]: MaterialPair<MeshStandardMaterial>;
// 	[ObjectType.LINE_SEGMENTS]: LineBasicMaterial;
// 	[ObjectType.POINTS]: PointsMaterial;
// }

export function cadMaterialMesh(color: Color, wireframe: boolean) {
	const mat = MESH_MAT.clone();
	mat.wireframe = wireframe;
	mat.color = color;
	return mat;
}
export function cadMaterialMeshGroup() {
	return MESH_GROUP_MAT;
}
export function cadMaterialLine(color: Color) {
	const mat = LINES_MAT.clone();
	mat.color = color;
	return mat;
}
export function cadMaterialLineGroup() {
	return LINES_GROUP_MAT;
}
export function cadMaterialPoint() {
	const mat = POINTS_MAT; //.clone();
	// mat.color = color;
	return mat;
}

// export const CAD_MATERIAL: CadMaterial = {
// 	[ObjectType.MESH]: {
// 		plain: MESH_MAT,
// 		wireframe: MESH_MAT_WIREFRAME,
// 	},
// 	[ObjectType.LINE_SEGMENTS]: LINES_MAT,
// 	[ObjectType.POINTS]: POINTS_MAT,
// };

// export const HASH_CODE_MAX = Number.MAX_SAFE_INTEGER;
