import {Vector3, Vector4, Line3, BufferAttribute} from 'three';

import {QuadObject} from '../QuadObject';
import {Attribute} from '../../../Attribute';
import {closestPointsBetweenLines, ClosestPoints} from '../../../../LineUtils';

const _v4 = new Vector4();
const _p0 = new Vector3();
const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();
const _center = new Vector3();
const _line01 = new Line3();
const _line12 = new Line3();
const _line23 = new Line3();
const _line30 = new Line3();
const _line0p = new Vector3();
const _line1p = new Vector3();
const _line2p = new Vector3();
const _line3p = new Vector3();
const _delta0 = new Vector3();
const _delta1 = new Vector3();
const _delta2 = new Vector3();
const _delta3 = new Vector3();
const _closestPoints: ClosestPoints = {
	pointOnLine1: new Vector3(),
	pointOnLine2: new Vector3(),
};

export function quadInnerRadius(quadObject: QuadObject, i: number) {
	const quadGeometry = quadObject.geometry;
	const indices = quadGeometry.index;
	const srcPositions = quadGeometry.attributes.position.array;

	_v4.fromArray(indices, i * 4);
	_p0.fromArray(srcPositions, _v4.x * 3);
	_p1.fromArray(srcPositions, _v4.y * 3);
	_p2.fromArray(srcPositions, _v4.z * 3);
	_p3.fromArray(srcPositions, _v4.w * 3);
	_center.copy(_p0).add(_p1).add(_p2).add(_p3).multiplyScalar(0.25);

	_line01.start.copy(_p0);
	_line01.end.copy(_p1);
	_line12.start.copy(_p1);
	_line12.end.copy(_p2);
	_line23.start.copy(_p2);
	_line23.end.copy(_p3);
	_line30.start.copy(_p3);
	_line30.end.copy(_p0);

	_line01.closestPointToPoint(_center, false, _line0p);
	_line12.closestPointToPoint(_center, false, _line1p);
	_line23.closestPointToPoint(_center, false, _line2p);
	_line30.closestPointToPoint(_center, false, _line3p);

	const dist0 = _line0p.distanceTo(_center);
	const dist1 = _line1p.distanceTo(_center);
	const dist2 = _line2p.distanceTo(_center);
	const dist3 = _line3p.distanceTo(_center);

	let innerRadius = dist0;
	if (innerRadius > dist1) {
		innerRadius = dist1;
	}
	if (innerRadius > dist2) {
		innerRadius = dist2;
	}
	if (innerRadius > dist3) {
		innerRadius = dist3;
	}
	return innerRadius;
}

export function quadOuterRadius(quadObject: QuadObject, i: number) {
	const quadGeometry = quadObject.geometry;
	const indices = quadGeometry.index;
	const srcPositions = quadGeometry.attributes.position.array;

	_v4.fromArray(indices, i * 4);
	_p0.fromArray(srcPositions, _v4.x * 3);
	_p1.fromArray(srcPositions, _v4.y * 3);
	_p2.fromArray(srcPositions, _v4.z * 3);
	_p3.fromArray(srcPositions, _v4.w * 3);
	_center.copy(_p0).add(_p1).add(_p2).add(_p3).multiplyScalar(0.25);

	const dist0 = _p0.distanceTo(_center);
	const dist1 = _p1.distanceTo(_center);
	const dist2 = _p2.distanceTo(_center);
	const dist3 = _p3.distanceTo(_center);

	let outerRadius = 0;
	if (outerRadius < dist0) {
		outerRadius = dist0;
	}
	if (outerRadius < dist1) {
		outerRadius = dist1;
	}
	if (outerRadius < dist2) {
		outerRadius = dist2;
	}
	if (outerRadius < dist3) {
		outerRadius = dist3;
	}

	return outerRadius;
}

export interface QuadPrimitivePointPositions {
	p0: Vector3;
	p1: Vector3;
	p2: Vector3;
	p3: Vector3;
}
export interface QuadPrimitivePointIndices {
	i0: number;
	i1: number;
	i2: number;
	i3: number;
}
const _indexIndices: QuadPrimitivePointIndices = {
	i0: 0,
	i1: 0,
	i2: 0,
	i3: 0,
};
const _indices: QuadPrimitivePointIndices = {
	i0: 0,
	i1: 0,
	i2: 0,
	i3: 0,
};
const stride = 4;

export function quadPrimitivePointIndexIndices(primitiveIndex: number, target: QuadPrimitivePointIndices) {
	target.i0 = primitiveIndex * stride + 0;
	target.i1 = primitiveIndex * stride + 1;
	target.i2 = primitiveIndex * stride + 2;
	target.i3 = primitiveIndex * stride + 3;
}
export function quadPrimitivePointIndices(
	quadObject: QuadObject,
	primitiveIndex: number,
	target: QuadPrimitivePointIndices
) {
	quadPrimitivePointIndexIndices(primitiveIndex, _indexIndices);
	const quadGeometry = quadObject.geometry;
	const index = quadGeometry.index;
	target.i0 = index[_indexIndices.i0];
	target.i1 = index[_indexIndices.i1];
	target.i2 = index[_indexIndices.i2];
	target.i3 = index[_indexIndices.i3];
}

export function quadPrimitivePointPositions(
	quadObject: QuadObject,
	primitiveIndex: number,
	target: QuadPrimitivePointPositions
) {
	const quadGeometry = quadObject.geometry;
	const positionAttribute = quadGeometry.attributes[Attribute.POSITION] as BufferAttribute | undefined;
	if (!positionAttribute) {
		return target;
	}

	quadPrimitivePointIndices(quadObject, primitiveIndex, _indices);
	const positionArray = positionAttribute.array;

	target.p0.fromArray(positionArray, _indices.i0 * 3);
	target.p1.fromArray(positionArray, _indices.i1 * 3);
	target.p2.fromArray(positionArray, _indices.i2 * 3);
	target.p3.fromArray(positionArray, _indices.i3 * 3);
}

function _prepareLine(line: Line3, start: Vector3, end: Vector3) {
	line.start.copy(start);
	line.end.copy(end);
}
export function quadPointInset(
	points: QuadPrimitivePointPositions,
	_inset: number,
	target: QuadPrimitivePointPositions
) {
	_prepareLine(_line01, points.p0, points.p1);
	_prepareLine(_line12, points.p1, points.p2);
	_prepareLine(_line23, points.p2, points.p3);
	_prepareLine(_line30, points.p3, points.p0);

	_center.copy(points.p0).add(points.p1).add(points.p2).add(points.p3).multiplyScalar(0.25);

	_line01.closestPointToPoint(_center, false, _line0p);
	_line12.closestPointToPoint(_center, false, _line1p);
	_line23.closestPointToPoint(_center, false, _line2p);
	_line30.closestPointToPoint(_center, false, _line3p);

	_delta0.copy(_center).sub(_line0p);
	_delta1.copy(_center).sub(_line1p);
	_delta2.copy(_center).sub(_line2p);
	_delta3.copy(_center).sub(_line3p);

	const maxInset = Math.min(_delta0.length(), _delta1.length(), _delta2.length(), _delta3.length());
	const inset = _inset * maxInset;
	// target.p0.copy(points.p0);
	// target.p1.copy(points.p1);
	// target.p2.copy(points.p2);
	// target.p3.copy(points.p3);

	const _offsetLine = (line: Line3, delta: Vector3) => {
		delta.normalize().multiplyScalar(inset);
		line.start.add(delta);
		line.end.add(delta);
	};
	_offsetLine(_line01, _delta0);
	_offsetLine(_line12, _delta1);
	_offsetLine(_line23, _delta2);
	_offsetLine(_line30, _delta3);

	const _getIntersect = (line0: Line3, line1: Line3, target: Vector3) => {
		closestPointsBetweenLines(line0, line1, _closestPoints);
		target.copy(_closestPoints.pointOnLine1).add(_closestPoints.pointOnLine2).multiplyScalar(0.5);
	};
	_getIntersect(_line01, _line30, target.p0);
	_getIntersect(_line12, _line01, target.p1);
	_getIntersect(_line23, _line12, target.p2);
	_getIntersect(_line30, _line23, target.p3);

	// const _setDelta = (_line: Line3, invert: boolean, delta: Vector3, targetDelta: Vector3) => {
	// 	if (invert) {
	// 		targetDelta.copy(_line.end).sub(_line.start);
	// 	} else {
	// 		targetDelta.copy(_line.start).sub(_line.end);
	// 	}
	// 	targetDelta.normalize();
	// 	targetDelta.multiplyScalar(inset);
	// };
	// const _setDeltaPair = (
	// 	_line0: Line3,
	// 	_line1: Line3,
	// 	delta0: Vector3,
	// 	delta1: Vector3,
	// 	targetDelta0: Vector3,
	// 	targetDelta1: Vector3
	// ) => {
	// 	_setDelta(_line0, false, delta0, targetDelta0);
	// 	_setDelta(_line1, true, delta1, targetDelta1);
	// };

	// _setDeltaPair(_line01, _line30, _delta3, _delta0, _ptDelta01, _ptDelta03);
	// _setDeltaPair(_line12, _line01, _delta1, _delta0, _ptDelta12, _ptDelta10);
	// _setDeltaPair(_line23, _line12, _delta2, _delta1, _ptDelta23, _ptDelta21);
	// _setDeltaPair(_line30, _line23, _delta3, _delta2, _ptDelta30, _ptDelta32);

	// target.p0.sub(_ptDelta01).sub(_ptDelta03);
	// target.p1.sub(_ptDelta12).sub(_ptDelta10);
	// target.p2.sub(_ptDelta23).sub(_ptDelta21);
	// target.p3.sub(_ptDelta30).sub(_ptDelta32);
}
