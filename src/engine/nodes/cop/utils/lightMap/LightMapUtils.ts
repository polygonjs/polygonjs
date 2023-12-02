import {Object3D, Mesh} from 'three';
export function invertNormals(object: Object3D) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}

	// invert indices
	// const index = geometry.getIndex();
	// if (!index) {
	// 	return;
	// }
	// const indexArray = index.array as number[];
	// const polyCount = indexArray.length / 3;
	// let tmp: number = -1;
	// for (let i = 0; i < polyCount; i++) {
	// 	tmp = indexArray[i * 3];
	// 	indexArray[i * 3] = indexArray[i * 3 + 2];
	// 	indexArray[i * 3 + 2] = tmp;
	// }
	// index.needsUpdate = true;

	// invert normals
	const normalAttribute = geometry.getAttribute('normal');
	const array = normalAttribute.array;
	const length = array.length;
	for (let i = 0; i < length; i++) {
		array[i] *= -1;
	}
	normalAttribute.needsUpdate = true;
}
