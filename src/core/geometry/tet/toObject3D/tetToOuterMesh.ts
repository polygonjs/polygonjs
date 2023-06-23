import {Vector3, BufferGeometry, Float32BufferAttribute} from 'three';
import {TetGeometry} from '../TetGeometry';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {TET_FACE_POINT_INDICES, TetTesselationParams} from '../TetCommon';
import {tetSortPoints} from '../utils/tetSortPoints';
import {Attribute} from '../../Attribute';

const _p = new Vector3();

export function tetToOuterMesh(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {points, tetrahedrons} = tetGeometry;
	const newGeometry = new BufferGeometry();

	const pointIndexById: Map<number, number> = new Map();
	tetSortPoints(tetGeometry, pointIndexById);

	let facesCount = 0;
	tetrahedrons.forEach((tet) => {
		for (const neighbourData of tet.neighbours) {
			if (neighbourData == null) {
				facesCount++;
			}
		}
	});
	const positions: number[] = new Array(tetGeometry.pointsCount() * 3);
	const ids: number[] = new Array(tetGeometry.pointsCount() * 1);
	const indices: number[] = new Array(facesCount * 3);

	// let positionsCount = 0;
	let indicesCount = 0;
	points.forEach((point) => {
		_p.copy(point.position);
		const pointIndex = pointIndexById.get(point.id);
		if (pointIndex == null) {
			throw 'pointIndex is null';
		}
		_p.toArray(positions, pointIndex * 3);
		ids[pointIndex] = pointIndex;
		// positionsCount += 3;
	});

	tetrahedrons.forEach((tet) => {
		let faceIndex = 0;
		for (const neighbourData of tet.neighbours) {
			if (neighbourData == null) {
				const faceIndices = TET_FACE_POINT_INDICES[faceIndex];
				const id0 = tet.pointIds[faceIndices[0]];
				const id1 = tet.pointIds[faceIndices[1]];
				const id2 = tet.pointIds[faceIndices[2]];
				const index0 = pointIndexById.get(id0);
				const index1 = pointIndexById.get(id1);
				const index2 = pointIndexById.get(id2);
				if (index0 == null || index1 == null || index2 == null) {
					throw 'index is null';
				}
				indices[indicesCount] = index0;
				indices[indicesCount + 1] = index1;
				indices[indicesCount + 2] = index2;
				indicesCount += 3;
			}
			faceIndex++;
		}
	});

	newGeometry.setAttribute(Attribute.POSITION, new Float32BufferAttribute(positions, 3));
	newGeometry.setAttribute(Attribute.ID, new Float32BufferAttribute(ids, 1));
	newGeometry.setIndex(indices);
	newGeometry.computeVertexNormals();

	return BaseSopOperation.createObject(newGeometry, ObjectType.MESH);
}
