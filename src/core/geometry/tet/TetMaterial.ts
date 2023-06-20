import {FrontSide, LineBasicMaterial, MeshStandardMaterial, PointsMaterial} from 'three';

const MESH_MAT = new MeshStandardMaterial({
	color: 0xffffff,
	vertexColors: true,
	side: FrontSide,
	metalness: 0.0,
	roughness: 0.9,
});
const LINES_MAT = new LineBasicMaterial({
	color: 0xffffff,
	linewidth: 1,
	vertexColors: true,
});

const POINTS_MAT = new PointsMaterial({
	color: 0xffffff,
	size: 0.1,
	vertexColors: true,
});

export function tetMaterialMesh() {
	return MESH_MAT;
}
export function tetMaterialLine() {
	return LINES_MAT;
}
export function tetMaterialPoint() {
	return POINTS_MAT;
}
