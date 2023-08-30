// import type {Object3D, Mesh, LineSegments, Points} from 'three';

// export function primitivesCount(object: Object3D): number {
// 	if ((object as Mesh).isMesh) {
// 		return meshPrimitivesCount(object as Mesh);
// 	}
// 	if ((object as LineSegments).isLineSegments) {
// 		return lineSegmentsPrimitivesCount(object as Mesh);
// 	}
// 	if ((object as Points).isPoints) {
// 		return pointsPrimitivesCount(object as Mesh);
// 	}
// 	return 0;
// }
// function meshPrimitivesCount(object: Mesh): number {
// 	const geometry = object.geometry;
// 	if (!geometry) {
// 		return 0;
// 	}
// 	const index = geometry.getIndex();
// 	if (!index) {
// 		return 0;
// 	}
// 	return index.count / 3;
// }
// function lineSegmentsPrimitivesCount(object: Mesh): number {
// 	const geometry = object.geometry;
// 	if (!geometry) {
// 		return 0;
// 	}
// 	const index = geometry.getIndex();
// 	if (!index) {
// 		return 0;
// 	}
// 	return index.count / 2;
// }
// function pointsPrimitivesCount(object: Mesh): number {
// 	const geometry = object.geometry;
// 	if (!geometry) {
// 		return 0;
// 	}
// 	const index = geometry.getIndex();
// 	if (!index) {
// 		return 0;
// 	}
// 	return index.count;
// }
