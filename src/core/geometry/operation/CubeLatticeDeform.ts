import {Vector3, Object3D, Mesh, Line3} from 'three';
import {Attribute} from '../Attribute';

export type Vector3_8 = [Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3, Vector3];

export const DEFAULT_POSITIONS: Vector3_8 = [
	new Vector3(0, 0, 0),
	new Vector3(1, 0, 0),
	new Vector3(1, 0, 1),
	new Vector3(0, 0, 1),
	//
	new Vector3(0, 1, 0),
	new Vector3(1, 1, 0),
	new Vector3(1, 1, 1),
	new Vector3(0, 1, 1),
];

const _v3 = new Vector3();
const lb0 = new Line3();
const lb1 = new Line3();
const lt0 = new Line3();
const lt1 = new Line3();
const pb0 = new Vector3();
const pb1 = new Vector3();
const pt0 = new Vector3();
const pt1 = new Vector3();
const pb = new Vector3();
const pt = new Vector3();
const target = new Vector3();

export function cubeLatticeDeform(object: Object3D, points: Vector3_8, offset: Vector3) {
	const geometry = (object as Mesh).geometry;
	if (!geometry) {
		return;
	}
	const positionAttribute = geometry.attributes[Attribute.POSITION];
	if (!positionAttribute) {
		return;
	}
	const positionArray = positionAttribute.array;

	lb0.start = points[0];
	lb0.end = points[1];
	lb1.start = points[3];
	lb1.end = points[2];
	lt0.start = points[4];
	lt0.end = points[5];
	lt1.start = points[7];
	lt1.end = points[6];

	const pointsCount = positionArray.length / 3;
	for (let i = 0; i < pointsCount; i++) {
		_v3.fromArray(positionArray, i * 3);
		_v3.add(offset);

		interpolate(_v3, lb0, lb1, lt0, lt1, target);
		target.toArray(positionArray, i * 3);
	}

	positionAttribute.needsUpdate = true;
	geometry.computeVertexNormals();
}

function interpolate(p: Vector3, lb0: Line3, lb1: Line3, lt0: Line3, lt1: Line3, target: Vector3) {
	pb0.copy(lb0.start).lerp(lb0.end, p.x);
	pb1.copy(lb1.start).lerp(lb1.end, p.x);
	pt0.copy(lt0.start).lerp(lt0.end, p.x);
	pt1.copy(lt1.start).lerp(lt1.end, p.x);
	pb.copy(pb0).lerp(pb1, p.z);
	pt.copy(pt0).lerp(pt1, p.z);
	target.copy(pb).lerp(pt, p.y);
}
