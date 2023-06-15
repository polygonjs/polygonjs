import {Vector3} from 'three';

const d0 = new Vector3();
const d1 = new Vector3();
const d2 = new Vector3();
const d3 = new Vector3();
const d4 = new Vector3();
const d5 = new Vector3();
export function tetQuality(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3) {
	d0.copy(p1).sub(p0);
	d1.copy(p2).sub(p0);
	d2.copy(p3).sub(p0);
	d3.copy(p2).sub(p1);
	d4.copy(p3).sub(p2);
	d5.copy(p1).sub(p3);

	const s0 = d0.length();
	const s1 = d1.length();
	const s2 = d2.length();
	const s3 = d3.length();
	const s4 = d4.length();
	const s5 = d5.length();

	const ms = (s0 * s0 + s1 * s1 + s2 * s2 + s3 * s3 + s4 * s4 + s5 * s5) / 6.0;
	const rms = Math.sqrt(ms);

	const s = 12.0 / Math.sqrt(2.0);

	const vol = d0.dot(d1.cross(d2)) / 6.0;
	return (s * vol) / (rms * rms * rms);
	// 1.0 for regular tetrahedron
}
