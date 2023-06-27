import {TetGeometry} from '../TetGeometry';
import {TetTesselationParams} from '../TetCommon';
import {BufferGeometry, Float32BufferAttribute} from 'three';
import {ObjectType} from '../../Constant';
import {BaseSopOperation} from '../../../../engine/operations/sop/_Base';
import {tetSortPoints} from '../utils/tetSortPoints';
import {Attribute} from '../../Attribute';

export function tetToPoints(tetGeometry: TetGeometry, tesselationParams: TetTesselationParams) {
	const {points} = tetGeometry;

	const newGeometry = new BufferGeometry();

	const pointIndexById: Map<number, number> = new Map();
	tetSortPoints(tetGeometry, pointIndexById);

	const positions: number[] = new Array(tetGeometry.pointsCount() * 1 * 3); // 3 coordinates per point
	const ids: number[] = new Array(tetGeometry.pointsCount() * 1);
	const indices: number[] = new Array(tetGeometry.pointsCount() * 1); // 1 entry per point

	points.forEach((point) => {
		const pointIndex = pointIndexById.get(point.id);
		if (pointIndex == null) {
			throw 'pointIndex is null';
		}

		point.position.toArray(positions, pointIndex * 3);
		ids[pointIndex] = pointIndex;
		indices[pointIndex] = pointIndex;
	});

	newGeometry.setAttribute(Attribute.POSITION, new Float32BufferAttribute(positions, 3));
	newGeometry.setAttribute(Attribute.ID, new Float32BufferAttribute(ids, 1));
	newGeometry.setIndex(indices);
	return BaseSopOperation.createObject(newGeometry, ObjectType.POINTS);
}
