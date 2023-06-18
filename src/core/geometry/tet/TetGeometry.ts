import {Vector3} from 'three';
import {Number2, Number3, Number4} from '../../../types/GlobalTypes';
import {TET_FACE_POINT_INDICES} from './TetCommon';

const PRECISION = 6;
const _sortedIndices: Number3 = [0, 0, 0];
function vector3ToStr(x: number, y: number, z: number) {
	return `${x.toFixed(PRECISION)}:${y.toFixed(PRECISION)}:${z.toFixed(PRECISION)}`;
}
function number3ToStr(x: number, y: number, z: number) {
	return `${x}:${y}:${z}`;
}

function sortedIndices(tetrahedron: Number4, facePointIndices: Number3, target: Number3) {
	const index0 = tetrahedron[facePointIndices[0]];
	const index1 = tetrahedron[facePointIndices[1]];
	const index2 = tetrahedron[facePointIndices[2]];
	const tmp = [index0, index1, index2].sort((a, b) => a - b);
	target[0] = tmp[0];
	target[1] = tmp[1];
	target[2] = tmp[2];
	return;
	if (index0 < index1) {
		if (index1 < index2) {
			target[0] = index0;
			target[1] = index1;
			target[2] = index2;
		} else {
			target[0] = index0;
			target[1] = index2;
			target[2] = index1;
		}
		return;
	}
	if (index0 < index2) {
		target[0] = index1;
		target[1] = index0;
		target[2] = index2;
	} else {
		if (index1 < index2) {
			target[0] = index1;
			target[1] = index2;
			target[2] = index0;
		} else {
			target[0] = index2;
			target[1] = index1;
			target[2] = index0;
		}
	}
}

export class TetGeometry {
	private _pointsMap: Map<string, number> = new Map();
	public readonly points: Vector3[] = [];
	public readonly faces: Map<string, Number2> = new Map();
	public readonly tetrahedrons: Array<Number4> = [];

	addPoint(x: number, y: number, z: number) {
		const key = vector3ToStr(x, y, z);
		if (this._pointsMap.has(key)) {
			return this._pointsMap.get(key)!;
		}
		const p = new Vector3(x, y, z);
		const index = this.points.length;
		this._pointsMap.set(key, index);
		this.points.push(p);
		return index;
	}

	addTetrahedron(p0: number, p1: number, p2: number, p3: number) {
		if (p0 == p1 || p0 == p2 || p0 == p3 || p1 == p2 || p1 == p3 || p2 == p3) {
			console.warn('tetrahedron has duplicate points', p0, p1, p2, p3);
			return;
		}
		const tetrahedron: Number4 = [p0, p1, p2, p3];
		const index = this.tetrahedrons.length;
		this.tetrahedrons.push(tetrahedron);
		this._updateFaces(tetrahedron, index);
	}
	neighbourTet(tetIndex: number, faceIndex: number) {
		const tetrahedron = this.tetrahedrons[tetIndex];
		sortedIndices(tetrahedron, TET_FACE_POINT_INDICES[faceIndex], _sortedIndices);
		const key = number3ToStr(_sortedIndices[0], _sortedIndices[1], _sortedIndices[2]);
		const faceNeighbour = this.faces.get(key);
		if (!faceNeighbour) {
			return false;
		}
		if (faceNeighbour[0] == tetIndex) {
			return faceNeighbour[1];
		}
		faceNeighbour[0];
	}

	private _updateFaces(tetrahedron: Number4, tetIndex: number) {
		for (let facePointIndices of TET_FACE_POINT_INDICES) {
			sortedIndices(tetrahedron, facePointIndices, _sortedIndices);
			const key = number3ToStr(_sortedIndices[0], _sortedIndices[1], _sortedIndices[2]);
			let currentFaceNeighbour = this.faces.get(key);
			if (!currentFaceNeighbour) {
				currentFaceNeighbour = [-1, -1];
				this.faces.set(key, currentFaceNeighbour);
			}
			if (currentFaceNeighbour[0] != -1 && currentFaceNeighbour[1] != -1) {
				console.warn('faces already assigned');
				return;
			}
			if (currentFaceNeighbour[0] != -1) {
				currentFaceNeighbour[1] = tetIndex;
			} else {
				currentFaceNeighbour[0] = tetIndex;
			}
		}
	}

	clone(): this {
		const newGeometry = new TetGeometry();
		const {points, tetrahedrons} = this;
		for (let point of points) {
			newGeometry.addPoint(point.x, point.y, point.z);
		}

		for (let tetrahedron of tetrahedrons) {
			newGeometry.addTetrahedron(tetrahedron[0], tetrahedron[1], tetrahedron[2], tetrahedron[3]);
		}
		return newGeometry as this;
	}
}
