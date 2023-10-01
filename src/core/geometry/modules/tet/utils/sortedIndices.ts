import {Number3} from '../../../../../types/GlobalTypes';
import {Tetrahedron} from '../TetCommon';

export function sortedNumber3(index0: number, index1: number, index2: number, target: Number3) {
	if (index0 < index1) {
		if (index1 < index2) {
			target[0] = index0;
			target[1] = index1;
			target[2] = index2;
		} else {
			if (index0 < index2) {
				target[0] = index0;
				target[1] = index2;
				target[2] = index1;
			} else {
				target[0] = index2;
				target[1] = index0;
				target[2] = index1;
			}
		}
	} else {
		if (index0 < index2) {
			target[0] = index1;
			target[1] = index0;
			target[2] = index2;
		} else {
			if (index1 < index2) {
				target[0] = index1;
				target[1] = index2;
				target[2] = index0;
			} else {
				target[0] = index2;
				target[1] = index1;
				target[2] = index0;
			}
		}
	}
}

export function sortedIndices(tetrahedron: Tetrahedron, facePointIndices: Number3, target: Number3) {
	const index0 = tetrahedron.pointIds[facePointIndices[0]];
	const index1 = tetrahedron.pointIds[facePointIndices[1]];
	const index2 = tetrahedron.pointIds[facePointIndices[2]];
	// const tmp = [index0, index1, index2].sort((a, b) => a - b);
	// target[0] = tmp[0];
	// target[1] = tmp[1];
	// target[2] = tmp[2];
	// return;
	sortedNumber3(index0, index1, index2, target);
}
