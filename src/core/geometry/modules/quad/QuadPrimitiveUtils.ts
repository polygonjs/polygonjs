import {Vector4} from 'three';
import {Number4} from '../../../../types/GlobalTypes';
import {QuadObject} from './QuadObject';
import {mod} from '../../../math/_Module';

export interface QuadOppositePoints {
	p0: number;
	p1: number;
}
const _v4 = new Vector4();
const pointIndices: Number4 = [0, 0, 0, 0];
export function quadPrimitiveOppositePoints(
	object: QuadObject,
	quadId: number,
	pointIndex: number,
	target: QuadOppositePoints
) {
	const indices = object.geometry.index;
	_v4.fromArray(indices, quadId * 4);
	_v4.toArray(pointIndices);
	const currentPointIndex = pointIndices.indexOf(pointIndex);
	target.p0 = pointIndices[mod(currentPointIndex - 1, 4)];
	target.p1 = pointIndices[(currentPointIndex + 1) % 4];
}
