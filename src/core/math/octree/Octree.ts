import {Box3, Sphere, Vector3} from 'three';
import {BaseCorePoint} from '../../geometry/entities/point/CorePoint';
import {OctreeNode, OctreeNodeTraverseCallback} from './Node';
import {arraySortBy} from '../../ArrayUtils';

const _position = new Vector3();

export class CoreOctree {
	private _root: OctreeNode;

	constructor(bbox: Box3) {
		this._root = new OctreeNode(bbox);
	}

	setPoints(points: BaseCorePoint[]) {
		this._root.setPoints(points);
	}

	traverse(callback: OctreeNodeTraverseCallback) {
		this._root.traverse(callback);
	}

	// TODO: I am tempted to stop going through the leaves if
	// the ones currently seen already have the required number of points.
	// but that probably doesn't work as those points may end up being further
	// than the ones from the following leaf
	findPoints(position: Vector3, distance: number, maxPointsCount: number | null, target: BaseCorePoint[]): void {
		const sphere = new Sphere(position, distance);

		if (this._root.intersectsSphere(sphere)) {
			this._root.pointsInSphere(sphere, target);
		}

		if (maxPointsCount == null) {
			return;
		} else {
			if (target.length > maxPointsCount) {
				target = arraySortBy(target, (point) => {
					return point.position(_position).distanceTo(position);
				});

				target = target.slice(0, maxPointsCount);
			}
		}
	}
}
