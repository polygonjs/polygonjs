import {Mesh} from 'three';
export function meshInverse(mesh: Mesh) {
	const index = mesh.geometry.getIndex();
	if (!index) {
		return;
	}
	const facesCount = index.count / 3;
	const array = index.array;
	for (let i = 0; i < facesCount; i++) {
		const a = array[i * 3];
		const b = array[i * 3 + 1];
		const c = array[i * 3 + 2];
		array[i * 3] = c;
		array[i * 3 + 1] = b;
		array[i * 3 + 2] = a;
	}
}
