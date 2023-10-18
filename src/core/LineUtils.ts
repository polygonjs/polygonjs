import {Line3, Vector3} from 'three';

export interface ClosestPoints {
	pointOnLine1: Vector3;
	pointOnLine2: Vector3;
}

const _u = new Vector3();
const _v = new Vector3();
const _w = new Vector3();
const EPS = 1e-4;

export function closestPointsBetweenLines(line1: Line3, line2: Line3, target: ClosestPoints) {
	_u.copy(line1.end).sub(line1.start);
	_v.copy(line2.end).sub(line2.start);
	_w.copy(line1.start).sub(line2.start);

	const a = _u.dot(_u);
	const b = _u.dot(_v);
	const c = _v.dot(_v);
	const d = _u.dot(_w);
	const e = _v.dot(_w);
	const D = a * c - b * b;

	let sc: number;
	let tc: number;
	if (D < EPS) {
		// The lines are almost parallel
		sc = 0;
		tc = b > c ? d / b : e / c; // Use the largest denominator
	} else {
		sc = (b * e - c * d) / D;
		tc = (a * e - b * d) / D;
	}

	target.pointOnLine1.addVectors(line1.start, _u.multiplyScalar(sc));
	target.pointOnLine2.addVectors(line2.start, _v.multiplyScalar(tc));
}
