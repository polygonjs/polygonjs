import {TetGeometry} from '../TetGeometry';
import {Vector3} from 'three';

export function tetCenter(tetGeometry: TetGeometry, tetId: number, target: Vector3) {
	const points = tetGeometry.points;
	const tet = tetGeometry.tetrahedrons.get(tetId);
	if (!tet) {
		return;
	}
	const id0 = tet.pointIds[0];
	const id1 = tet.pointIds[1];
	const id2 = tet.pointIds[2];
	const id3 = tet.pointIds[3];
	const pt0 = points.get(id0);
	const pt1 = points.get(id1);
	const pt2 = points.get(id2);
	const pt3 = points.get(id3);
	if (!(pt0 && pt1 && pt2 && pt3)) {
		return;
	}
	target.copy(pt0.position).add(pt1.position).add(pt2.position).add(pt3.position).multiplyScalar(0.25);
}

const b = new Vector3();
const c = new Vector3();
const d = new Vector3();
const b2 = new Vector3();
const c2 = new Vector3();
const d2 = new Vector3();

export function getCircumCenter(p0: Vector3, p1: Vector3, p2: Vector3, p3: Vector3, target: Vector3) {
	b.copy(p1).sub(p0);
	c.copy(p2).sub(p0);
	d.copy(p3).sub(p0);

	const det: number =
		2.0 * (b.x * (c.y * d.z - c.z * d.y) - b.y * (c.x * d.z - c.z * d.x) + b.z * (c.x * d.y - c.y * d.x));
	if (det == 0.0) {
		return target.copy(p0);
	} else {
		const dotb = b.dot(b);
		const dotc = c.dot(c);
		const dotd = d.dot(d);
		const cd = c2.copy(c).cross(d);
		const db = d2.copy(d).cross(b);
		const bc = b2.copy(b).cross(c);
		cd.multiplyScalar(dotb).add(db.multiplyScalar(dotc)).add(bc.multiplyScalar(dotd));
		cd.divideScalar(det);
		return target.copy(p0).add(cd);
	}
}

export function tetCircumCenter(tetGeometry: TetGeometry, tetId: number, target: Vector3) {
	const tet = tetGeometry.tetrahedrons.get(tetId);
	if (!tet) {
		return;
	}
	const pt0 = tetGeometry.points.get(tet.pointIds[0]);
	const pt1 = tetGeometry.points.get(tet.pointIds[1]);
	const pt2 = tetGeometry.points.get(tet.pointIds[2]);
	const pt3 = tetGeometry.points.get(tet.pointIds[3]);
	if (!(pt0 && pt1 && pt2 && pt3)) {
		return;
	}
	getCircumCenter(pt0.position, pt1.position, pt2.position, pt3.position, target);
}
