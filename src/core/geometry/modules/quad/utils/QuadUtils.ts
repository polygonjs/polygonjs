import {Vector3, Vector4, Line3} from 'three';

import {QuadObject} from '../QuadObject';

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
