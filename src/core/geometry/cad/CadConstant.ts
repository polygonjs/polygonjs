import {FrontSide, LineBasicMaterial, MeshStandardMaterial, PointsMaterial, Material} from 'three';
import {ObjectType} from '../Constant';
// import {CsgObjectType} from './CsgToObject3D';

// export interface CsgObjectData {
// 	type: CsgObjectType;
// }
export const step = 0.000001;

interface MaterialPair {
	plain: Material;
	wireframe: Material;
}
const MESH_MAT = new MeshStandardMaterial({
	color: 0xffffff,
	// vertexColors: true,
	side: FrontSide,
	metalness: 0.0,
	roughness: 0.9,
});
const MESH_MAT_WIREFRAME = (() => {
	const mat = MESH_MAT.clone();
	mat.wireframe = true;
	return mat;
})();
const LINES_MAT = new LineBasicMaterial({
	color: 0xffffff,
	linewidth: 1,
});
const POINTS_MAT = new PointsMaterial({
	color: 0xffffff,
	size: 0.1,
});

interface CadMaterial {
	[ObjectType.MESH]: MaterialPair;
	[ObjectType.LINE_SEGMENTS]: MaterialPair;
	[ObjectType.POINTS]: MaterialPair;
}

export const CAD_MATERIAL: CadMaterial = {
	[ObjectType.MESH]: {
		plain: MESH_MAT,
		wireframe: MESH_MAT_WIREFRAME,
	},
	[ObjectType.LINE_SEGMENTS]: {
		plain: LINES_MAT,
		wireframe: LINES_MAT,
	},
	[ObjectType.POINTS]: {
		plain: POINTS_MAT,
		wireframe: POINTS_MAT,
	},
};

// export const HASH_CODE_MAX = Number.MAX_SAFE_INTEGER;
