import {Box3, Sphere, Vector3} from 'three';
import {CorePoint} from '../../geometry/entities/point/CorePoint';
import {OctreeNode, OctreeNodeTraverseCallback} from './Node';
import {ArrayUtils} from '../../ArrayUtils';

const _position = new Vector3();

export class CoreOctree {
	private _root: OctreeNode;

	constructor(bbox: Box3) {
		this._root = new OctreeNode(bbox);
	}

	// set_bounding_box(bbox: Box3) {
	// 	this._root.set_bounding_box(bbox)
	// }

	set_points(points: CorePoint[]) {
		this._root.set_points(points);
	}

	traverse(callback: OctreeNodeTraverseCallback) {
		this._root.traverse(callback);
	}

	// TODO: I am tempted to stop going through the leaves if
	// the ones currently seen already have the required number of points.
	// but that probably doesn't work as those points may end up being further
	// than the ones from the following leaf
	find_points(position: Vector3, distance: number, max_points_count?: number): CorePoint[] {
		const sphere = new Sphere(position, distance);
		let found_points: CorePoint[] = [];

		if (this._root.intersects_sphere(sphere)) {
			this._root.points_in_sphere(sphere, found_points);
		}

		if (max_points_count == null) {
			return found_points;
		} else {
			if (found_points.length > max_points_count) {
				found_points = ArrayUtils.sortBy(found_points, (point) => {
					return point.position(_position).distanceTo(position);
				});

				found_points = found_points.slice(0, max_points_count);
			}

			return found_points;
		}
	}
}
