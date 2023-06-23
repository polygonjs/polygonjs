import {Vector3, BufferGeometry, Float32BufferAttribute} from 'three';
import {TetGeometry} from '../TetGeometry';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {TET_FACE_POINT_INDICES, TetTesselationParams} from '../TetCommon';
import {tetCenter} from '../utils/tetCenter';

const _center = new Vector3();
const _p = new Vector3();

export function tetToTetMesh(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {scale} = tesselationParams;
	const {points, tetrahedrons} = tetGeometry;
	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(tetGeometry.tetsCount() * 4 * 3);
	const indices: number[] = new Array(tetGeometry.tetsCount() * 4 * 3);

	let positionsCount = 0;
	let indicesCount = 0;
	tetrahedrons.forEach((tet) => {
		// get center
		tetCenter(tetGeometry, tet.id, _center);

		for (let face of TET_FACE_POINT_INDICES) {
			for (let facePointIndex of face) {
				const pointId = tet.pointIds[facePointIndex];
				const point = points.get(pointId);
				if (point) {
					_p.copy(point.position).sub(_center).multiplyScalar(scale).add(_center);
					_p.toArray(positions, positionsCount);
					positionsCount += 3;
				}
			}
			indices[indicesCount] = indicesCount;
			indices[indicesCount + 1] = indicesCount + 1;
			indices[indicesCount + 2] = indicesCount + 2;
			indicesCount += 3;
		}
	});

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	newGeometry.computeVertexNormals();

	return BaseSopOperation.createObject(newGeometry, ObjectType.MESH);
}
