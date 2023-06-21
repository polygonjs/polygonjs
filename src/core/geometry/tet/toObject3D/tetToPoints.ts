import {TetGeometry} from '../TetGeometry';
import {TetTesselationParams} from '../TetCommon';
import {BufferGeometry, Float32BufferAttribute} from 'three';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';

export function tetToPoints(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {points} = tetGeometry;

	const newGeometry = new BufferGeometry();
	const positions: number[] = new Array(tetGeometry.pointsCount() * 1 * 3); // 3 coordinates per point
	const indices: number[] = new Array(tetGeometry.pointsCount() * 1); // 1 entry per point

	let positionsCount = 0;
	let indicesCount = 0;
	let indexCount = 0;
	points.forEach((point) => {
		indices[indicesCount] = indexCount;

		point.position.toArray(positions, positionsCount);
		positionsCount += 3;

		//
		indicesCount += 1;
		indexCount += 1;
	});

	newGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	newGeometry.setIndex(indices);
	return BaseSopOperation.createObject(newGeometry, ObjectType.POINTS);
}
