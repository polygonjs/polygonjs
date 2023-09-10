import {TetGeometry} from '../TetGeometry';
import {TetTesselationParams} from '../TetCommon';
import {BufferGeometry, Float32BufferAttribute, Vector3} from 'three';
import {ObjectType} from '../../../Constant';
import {BaseSopOperation} from '../../../../../engine/operations/sop/_Base';
import {tetCircumCenter} from '../utils/tetCenter';

const _center = new Vector3();
const _p = new Vector3();

export function tetToCenter(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {tetrahedrons} = tetGeometry;

	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(tetGeometry.tetsCount() * 1 * 3); // 1 points tetrahedron, 3 coordinates per point
	const indices: number[] = new Array(tetGeometry.tetsCount() * 1); // 1 entry per point

	let positionsCount = 0;
	let indicesCount = 0;
	let indexCount = 0;
	tetrahedrons.forEach((tet) => {
		tetCircumCenter(tetGeometry, tet.id, _center);

		// point 0
		indices[indicesCount] = indexCount;

		_p.copy(_center);
		_p.toArray(positions, positionsCount);
		positionsCount += 3;

		//
		indicesCount += 1;
		indexCount += 1;
	});

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	return BaseSopOperation.createObject(newGeometry, ObjectType.POINTS);
}
