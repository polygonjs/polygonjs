import {TetGeometry} from '../TetGeometry';
import {TetTesselationParams} from '../TetCommon';
import {BufferGeometry, Float32BufferAttribute, Vector3} from 'three';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {tetCenter} from '../utils/tetCenter';

const _center = new Vector3();
const _p = new Vector3();

export function tetToLines(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {scale} = tesselationParams;
	const {points, tetrahedrons} = tetGeometry;

	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(tetGeometry.tetsCount() * 4 * 3); // 4 points per tetrahedron, 3 coordinates per point
	const indices: number[] = new Array(tetGeometry.tetsCount() * 6 * 2); // 6 lines per tetrahedron, 2 indices per line

	let positionsCount = 0;
	let indicesCount = 0;
	let indexCount = 0;
	tetrahedrons.forEach((tet) => {
		tetCenter(tetGeometry, tet.id, _center);

		// line 0
		indices[indicesCount] = indexCount;
		indices[indicesCount + 1] = indexCount + 1;
		// line 1
		indices[indicesCount + 2] = indexCount;
		indices[indicesCount + 3] = indexCount + 2;
		// line 2
		indices[indicesCount + 4] = indexCount;
		indices[indicesCount + 5] = indexCount + 3;
		// line 3
		indices[indicesCount + 6] = indexCount + 1;
		indices[indicesCount + 7] = indexCount + 2;
		// line 4
		indices[indicesCount + 8] = indexCount + 1;
		indices[indicesCount + 9] = indexCount + 3;
		// line 5
		indices[indicesCount + 10] = indexCount + 2;
		indices[indicesCount + 11] = indexCount + 3;

		for (let i = 0; i < 4; i++) {
			const pointId = tet.pointIds[i];
			const point = points.get(pointId);
			if (point) {
				_p.copy(point.position).sub(_center).multiplyScalar(scale).add(_center);
				_p.toArray(positions, positionsCount);
				positionsCount += 3;
			}
		}

		//
		indicesCount += 12;
		indexCount += 4;
	});

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	return BaseSopOperation.createObject(newGeometry, ObjectType.LINE_SEGMENTS);
}
