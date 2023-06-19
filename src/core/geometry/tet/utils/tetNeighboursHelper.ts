import {TetGeometry} from '../TetGeometry';
import {sortedNumber3} from './sortedIndices';
import {TET_FACE_POINT_INDICES, Tetrahedron} from '../TetCommon';
import {Number3} from '../../../../types/GlobalTypes';

const _sortedIndices: Number3 = [0, 0, 0];
const _sortedIndicesNeighbour: Number3 = [0, 0, 0];

export function updateTetNeighboursFromNewTet(tetGeometry: TetGeometry, tet: Tetrahedron) {
	for (let id0 = 0; id0 < 4; id0++) {
		const sharedPoint = tet.pointIds[id0];
		const tetsSharingPoint = tetGeometry.tetrahedronsByPointId.get(sharedPoint);
		let faceIndex = 0;
		for (let facePointIndices of TET_FACE_POINT_INDICES) {
			if (!tetsSharingPoint) {
				continue;
			}
			sortedNumber3(
				tet.pointIds[facePointIndices[0]],
				tet.pointIds[facePointIndices[1]],
				tet.pointIds[facePointIndices[2]],
				_sortedIndices
			);
			const [pt0, pt1, pt2] = _sortedIndices;
			tetsSharingPoint.forEach((tetId) => {
				if (tetId == tet.id) {
					return;
				}
				const tetSharingPoint = tetGeometry.tetrahedrons.get(tetId);
				if (!tetSharingPoint) {
					return;
				}
				let faceIndexNeighbour = 0;
				for (let facePointIndicesNeighbour of TET_FACE_POINT_INDICES) {
					sortedNumber3(
						tetSharingPoint.pointIds[facePointIndicesNeighbour[0]],
						tetSharingPoint.pointIds[facePointIndicesNeighbour[1]],
						tetSharingPoint.pointIds[facePointIndicesNeighbour[2]],
						_sortedIndicesNeighbour
					);
					const [ptN0, ptN1, ptN2] = _sortedIndicesNeighbour;

					if (pt0 == ptN0 && pt1 == ptN1 && pt2 == ptN2) {
						tet.neighbours[faceIndex] = {id: tetSharingPoint.id, faceIndex: faceIndexNeighbour};
						tetSharingPoint.neighbours[faceIndexNeighbour] = {id: tet.id, faceIndex: faceIndex};
					}

					faceIndexNeighbour++;
				}

				// if(tetSharingPoint.pointIds.includes(tet.pointIds[facePointIndices[1]]) && tetSharingPoint.pointIds.includes(tet.pointIds[facePointIndices[2]])){
				// 	tet.neighbours[faceIndex] = {tetSharingPoint.id}
				// }
			});
			faceIndex++;
		}
	}
}

export function tetNeighbour(tetGeometry: TetGeometry, tetId: number, faceIndex: number) {
	const tetrahedron = tetGeometry.tetrahedrons.get(tetId);
	if (!tetrahedron) {
		return;
	}
	console.log('neighbours', tetId, tetrahedron.neighbours, tetrahedron.neighbours[faceIndex]);
	return tetrahedron.neighbours[faceIndex]?.id;
	// sortedIndices(tetrahedron, TET_FACE_POINT_INDICES[faceIndex], _sortedIndices);
	// const key = string3ToStr(_sortedIndices[0], _sortedIndices[1], _sortedIndices[2]);
	// const faceNeighbour = this.faces.get(key);
	// if (!faceNeighbour) {
	// 	return null;
	// }
	// if (faceNeighbour[0] == tetIndex) {
	// 	return faceNeighbour[1];
	// }
	// faceNeighbour[0];
}
