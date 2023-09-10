import {Number4} from '../../../../types/GlobalTypes';
import {mapFirstKey} from '../../../MapUtils';
import {
	TetrahedronPoint,
	Tetrahedron,
	TetNeighbourData,
	TetNeighbourDatas,
	TetNeighbourDataWithSource,
	TET_FACE_POINT_INDICES,
} from './TetCommon';
import {updateTetNeighboursFromNewTet} from './utils/tetNeighboursHelper';
import {Vector3, Triangle, Matrix4, Box3, Sphere} from 'three';
import {circumSphere} from './utils/tetSphere';
import {tetFaceTriangle} from './utils/tetTriangle';
import {logRedBg} from '../../../logger/Console';
const _triangle = new Triangle();
const _triangleNormal = new Vector3();
const _newPointDelta = new Vector3();

export class TetGeometry {
	public readonly tetrahedrons: Map<number, Tetrahedron> = new Map();
	public readonly points: Map<number, TetrahedronPoint> = new Map();
	public readonly tetrahedronsByPointId: Map<number, Set<number>> = new Map();
	private _nextPointId = -1;
	private _nextTetId = -1;
	private _pointsCount = 0;
	private _tetsCount = 0;
	private _lastAddedTetId: number | null = null;

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
	removePoint(pointId: number) {
		this.points.delete(pointId);
		this.tetrahedronsByPointId.delete(pointId);
		this._pointsCount--;
	}

	pointsCount() {
		return this._pointsCount;
	}
	tetsCount() {
		return this._tetsCount;
	}

	firstTetId() {
		return mapFirstKey(this.tetrahedrons);
	}
	lastAddedTetId() {
		return this._lastAddedTetId;
	}

	addTetrahedron(p0: number, p1: number, p2: number, p3: number) {
		if (p0 == p1 || p0 == p2 || p0 == p3 || p1 == p2 || p1 == p3 || p2 == p3) {
			console.warn('tetrahedron has duplicate points', p0, p1, p2, p3);
			return;
		}
		this._nextTetId++;
		const id = this._nextTetId;
		const _circumSphere = {center: new Vector3(), radius: 0};
		circumSphere(this, p0, p1, p2, p3, _circumSphere);
		const tetrahedron: Tetrahedron = {
			id,
			pointIds: [p0, p1, p2, p3],
			neighbours: [null, null, null, null],
			sphere: _circumSphere,
			disposed: false,
		};
		this.tetrahedrons.set(tetrahedron.id, tetrahedron);
		this._tetsCount++;
		this._lastAddedTetId = tetrahedron.id;

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
		return id;
	}
	removeTets(
		tetIds: number[],
		sharedFacesNeighbourData?: Set<TetNeighbourDataWithSource>,
		newPointPosition?: Vector3
	) {
		if (sharedFacesNeighbourData && newPointPosition) {
			sharedFacesNeighbourData.clear();

			// 1. store neighbours for future tet reconstruction
			for (let tetId of tetIds) {
				const tetrahedron = this.tetrahedrons.get(tetId);
				if (!tetrahedron) {
					continue;
				}
				let faceIndex = 0;
				for (let neighbourData of tetrahedron.neighbours) {
					// if the neighbour is not one of the removed tets,
					// we can add it
					if (neighbourData == null || !tetIds.includes(neighbourData.id)) {
						let faceAvailableOnSideOfNewPoint = true;
						if (neighbourData && neighbourData.id != null) {
							tetFaceTriangle(this, neighbourData.id, neighbourData.faceIndex, _triangle);
							_triangle.getNormal(_triangleNormal);
							_newPointDelta.copy(_triangle.a).sub(newPointPosition);
							if (_triangleNormal.dot(_newPointDelta) > 0) {
								// logRedBg(`nope:${tetId}`);
								faceAvailableOnSideOfNewPoint = false;
							}
						}

						if (faceAvailableOnSideOfNewPoint) {
							const pointIndices = TET_FACE_POINT_INDICES[faceIndex];
							sharedFacesNeighbourData.add({
								// faceIndex,
								pointIds: [
									tetrahedron.pointIds[pointIndices[0]],
									tetrahedron.pointIds[pointIndices[1]],
									tetrahedron.pointIds[pointIndices[2]],
								],
							});
						}
					}
					faceIndex++;
				}
			}
		}

		// 2. remove tets
		for (let tetId of tetIds) {
			const tetrahedron = this.tetrahedrons.get(tetId);
			if (!tetrahedron) {
				logRedBg(`tet not found:${tetId} (${tetIds})`);
				throw `removeTets: tet not found ${tetId}`;
				continue;
			}

			// update point keys
			for (let pointId of tetrahedron.pointIds) {
				const tetrahedrons = this.tetrahedronsByPointId.get(pointId);
				if (tetrahedrons) {
					tetrahedrons.delete(tetrahedron.id);
					// DO not remove points here,
					// as they are still needed later
					// if (tetrahedrons.size == 0) {
					// 	this._removePoint(pointId);
					// }
				}
			}

			// remove neighbours
			for (let neighbourData of tetrahedron.neighbours) {
				if (neighbourData != null) {
					const neighbourTet = this.tetrahedrons.get(neighbourData.id);
					if (neighbourTet) {
						const neighbourFaceIndex = neighbourData.faceIndex;
						// remove from neighbour
						neighbourTet.neighbours[neighbourFaceIndex] = null;
					}
				}
			}

			// remove
			tetrahedron.disposed = true;
			this.tetrahedrons.delete(tetId);
			this._tetsCount--;
		}
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
				sphere: {
					center: tetrahedron.sphere.center.clone(),
					radius: tetrahedron.sphere.radius,
				},
				disposed: tetrahedron.disposed,
			});
		});
		this.tetrahedronsByPointId.forEach((tetrahedrons, id) => {
			newGeometry.tetrahedronsByPointId.set(id, new Set(tetrahedrons));
		});
		newGeometry._nextPointId = this._nextPointId;
		newGeometry._nextTetId = this._nextTetId;
		newGeometry._pointsCount = this._pointsCount;
		newGeometry._tetsCount = this._tetsCount;
		newGeometry._lastAddedTetId = this._lastAddedTetId;

		return newGeometry as this;
	}

	applyMatrix4(matrix: Matrix4) {
		this.points.forEach((point) => {
			point.position.applyMatrix4(matrix);
		});
		this.tetrahedrons.forEach((tetrahedron) => {
			circumSphere(
				this,
				tetrahedron.pointIds[0],
				tetrahedron.pointIds[1],
				tetrahedron.pointIds[2],
				tetrahedron.pointIds[3],
				tetrahedron.sphere
			);
		});
	}
	boundingBox(target: Box3): void {
		this.points.forEach((point) => {
			target.expandByPoint(point.position);
		});
	}
	boundingSphere(target: Sphere): void {
		this.points.forEach((point) => {
			target.expandByPoint(point.position);
		});
	}
}
