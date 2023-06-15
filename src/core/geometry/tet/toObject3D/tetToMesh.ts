import {Vector3, BufferGeometry, Float32BufferAttribute} from 'three';
import {TetGeometry} from '../TetGeometry';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {ObjectType} from '../../Constant';
import {TetTesselationParams} from '../TetCommon';
import {TET_FACES} from '../../tetrahedron/TetrahedronConstant';

const _center = new Vector3();
const _p = new Vector3();

export function tetToMesh(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {scale} = tesselationParams;
	const {points, tetrahedrons} = tetGeometry;
	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(points.length * 3);
	const indices: number[] = new Array(tetrahedrons.length * 3 * 4);

	let positionsCount = 0;
	let indicesCount = 0;
	for (let tet of tetrahedrons) {
		// get center
		_center.set(0, 0, 0);
		for (let pointIndex of tet) {
			const point = points[pointIndex];
			_center.add(point);
		}
		_center.multiplyScalar(0.25);

		for (let face of TET_FACES) {
			for (let facePointIndex of face) {
				const pointIndex = tet[facePointIndex];
				_p.copy(points[pointIndex]).sub(_center).multiplyScalar(scale).add(_center);
				_p.toArray(positions, positionsCount);
				positionsCount += 3;
			}
			indices[indicesCount] = indicesCount;
			indices[indicesCount + 1] = indicesCount + 1;
			indices[indicesCount + 2] = indicesCount + 2;
			indicesCount += 3;
		}
	}

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	newGeometry.computeVertexNormals();

	return BaseSopOperation.createObject(newGeometry, ObjectType.MESH);
}
