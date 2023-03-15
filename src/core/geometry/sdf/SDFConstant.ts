import {FrontSide, MeshStandardMaterial, Color} from 'three';

export const step = 0.000001;

const MESH_MAT = new MeshStandardMaterial({
	color: 0xffffff,
	// vertexColors: true,
	side: FrontSide,
	metalness: 0.0,
	roughness: 0.9,
});

export function sdfMaterialMesh(color: Color, wireframe: boolean) {
	const mat = MESH_MAT.clone();
	mat.wireframe = wireframe;
	mat.color = color;
	return mat;
}
