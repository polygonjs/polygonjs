import {FrontSide, LineBasicMaterial, MeshStandardMaterial, Color} from 'three';
// import {ObjectType} from '../Constant';
// import {CsgObjectType} from './CsgToObject3D';

// export interface CsgObjectData {
// 	type: CsgObjectType;
// }
export const step = 0.000001;

const MESH_MAT = new MeshStandardMaterial({
	color: 0xffffff,
	// vertexColors: true,
	side: FrontSide,
	metalness: 0.0,
	roughness: 0.9,
});
const LINES_MAT = new LineBasicMaterial({
	color: 0xffffff,
	linewidth: 1,
	// vertexColors: true,
});

export function csgMaterialMesh(color: Color, wireframe: boolean) {
	const mat = MESH_MAT.clone();
	mat.wireframe = wireframe;
	mat.color = color;
	return mat;
}
export function csgMaterialLine(color: Color) {
	const mat = LINES_MAT.clone();
	mat.color = color;
	return mat;
}

// export const CSG_MATERIAL = {
// 	[ObjectType.MESH]: ,
// 	[ObjectType.LINE_SEGMENTS]: new LineBasicMaterial({
// 		color: 0xffffff,
// 		linewidth: 1,
// 		vertexColors: true,
// 	}),
// };
