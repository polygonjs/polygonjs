import {Number4} from '../../../types/GlobalTypes';
import {
	TetrahedronPoint,
	Tetrahedron,
	TetNeighbourData,
	TetNeighbourDatas,
	TetNeighbourDataWithSource,
} from './TetCommon';
import {updateTetNeighboursFromNewTet} from './utils/tetNeighboursHelper';
import {Vector3} from 'three';

export class TetGeometry {
	public readonly tetrahedrons: Map<number, Tetrahedron> = new Map();
	public readonly points: Map<number, TetrahedronPoint> = new Map();
	public readonly tetrahedronsByPointId: Map<number, Set<number>> = new Map();
	private _nextPointId = -1;
	private _nextTetId = -1;
	private _pointsCount = 0;
	private _tetsCount = 0;

	addPoint(x: number, y: number, z: number) {
		this._nextPointId++;
		const id = this._nextPointId;
		const point: TetrahedronPoint = {
			id,
			position: new Vector3(x, y, z),
		};
		this._pointsCount++;
		this.points.set(point.id, point);

		return id;
	}

	pointsCount() {
		return this._pointsCount;
	}
	tetsCount() {
		return this._tetsCount;
	}

	firstTetId() {
		for (let [tetId] of this.tetrahedrons) {
			return tetId;
		}
	}

	addTetrahedron(p0: number, p1: number, p2: number, p3: number) {
		if (p0 == p1 || p0 == p2 || p0 == p3 || p1 == p2 || p1 == p3 || p2 == p3) {
			console.warn('tetrahedron has duplicate points', p0, p1, p2, p3);
			return;
		}
		this._nextTetId++;
		const id = this._nextTetId;
		const tetrahedron: Tetrahedron = {
			id,
			pointIds: [p0, p1, p2, p3],
			neighbours: [null, null, null, null],
		};
		this.tetrahedrons.set(tetrahedron.id, tetrahedron);
		this._tetsCount++;

		// update point keys
		for (let p of tetrahedron.pointIds) {
			let tetrahedrons = this.tetrahedronsByPointId.get(p);
			if (!tetrahedrons) {
				tetrahedrons = new Set();
				this.tetrahedronsByPointId.set(p, tetrahedrons);
			}
			tetrahedrons.add(tetrahedron.id);
		}
		// update neighbours
		updateTetNeighboursFromNewTet(this, tetrahedron);
	}
	removeTet(tetId: number, sharedFacesNeighbourData: Set<TetNeighbourDataWithSource>) {
		const tetrahedron = this.tetrahedrons.get(tetId);
		if (!tetrahedron) {
			return;
		}

		// update point keys
		for (let p of tetrahedron.pointIds) {
			const tetrahedrons = this.tetrahedronsByPointId.get(p);
			if (tetrahedrons) {
				tetrahedrons.delete(tetrahedron.id);
			}
		}

		// remove neighbours
		sharedFacesNeighbourData.clear();
		let faceIndex = 0;
		for (let neighbourData of tetrahedron.neighbours) {
			if (neighbourData != null) {
				const neighbourTet = this.tetrahedrons.get(neighbourData.id);
				if (neighbourTet) {
					const neighbourFaceIndex = neighbourData.faceIndex;
					// remove from neighbour
					neighbourTet.neighbours[neighbourFaceIndex] = null;
				}
			}
			sharedFacesNeighbourData.add({
				tetPointIds: tetrahedron.pointIds,
				faceIndex,
				neighbourData,
			});
			faceIndex++;
		}

		// remove
		this.tetrahedrons.delete(tetId);
		this._tetsCount--;
	}

	clone(): this {
		const newGeometry = new TetGeometry();

		this.points.forEach((point, id) => {
			newGeometry.points.set(id, {
				id: point.id,
				position: point.position.clone(),
			});
		});
		this.tetrahedrons.forEach((tetrahedron, id) => {
			newGeometry.tetrahedrons.set(id, {
				id: tetrahedron.id,
				pointIds: tetrahedron.pointIds.map((id) => id) as Number4,
				neighbours: tetrahedron.neighbours.map((d) => {
					if (!d) {
						return null;
					}
					const tetNeighbourData: TetNeighbourData = {
						id: d.id,
						faceIndex: d.faceIndex,
					};
					return tetNeighbourData;
				}) as TetNeighbourDatas,
			});
		});
		this.tetrahedronsByPointId.forEach((tetrahedrons, id) => {
			newGeometry.tetrahedronsByPointId.set(id, new Set(tetrahedrons));
		});
		newGeometry._nextPointId = this._nextPointId;
		newGeometry._nextTetId = this._nextTetId;
		newGeometry._pointsCount = this._pointsCount;
		newGeometry._tetsCount = this._tetsCount;

		return newGeometry as this;
	}
}
