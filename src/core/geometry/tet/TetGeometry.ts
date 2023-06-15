import {Vector3} from 'three';
import {Number4} from '../../../types/GlobalTypes';

function vector3ToStr(v: Vector3) {
	return `${v.x}:${v.y}:${v.z}`;
}

export class TetGeometry {
	private _pointsMap: Map<string, number> = new Map();
	public readonly points: Vector3[] = [];
	// public readonly faces: Array<Number3> = [];
	public readonly tetrahedrons: Array<Number4> = [];

	addPoint(p: Vector3) {
		const key = vector3ToStr(p);
		if (this._pointsMap.has(key)) {
			return this._pointsMap.get(key)!;
		}
		this.points.push(p);
		const index = this.points.length - 1;
		this._pointsMap.set(key, index);
		return index;
	}
	// addFace(i0: number, i1: number, i2: number) {
	// 	this.faces.push([i0, i1, i2]);
	// }
	addTetrahedron(p0: number, p1: number, p2: number, p3: number) {
		if (p0 == p1 || p0 == p2 || p0 == p3 || p1 == p2 || p1 == p3 || p2 == p3) {
			console.warn('tetrahedron has duplicate points');
			return;
		}
		this.tetrahedrons.push([p0, p1, p2, p3]);
	}

	clone(): this {
		const newGeometry = new TetGeometry();
		const {points, tetrahedrons} = this;
		for (let point of points) {
			newGeometry.addPoint(point.clone());
		}
		// for (let face of faces) {
		// 	newGeometry.addFace(face[0], face[1], face[2]);
		// }
		for (let tetrahedron of tetrahedrons) {
			newGeometry.addTetrahedron(tetrahedron[0], tetrahedron[1], tetrahedron[2], tetrahedron[3]);
		}
		return newGeometry as this;
	}
}
