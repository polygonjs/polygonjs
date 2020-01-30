import {Vector3} from 'three/src/math/Vector3';
import {Sphere} from 'three/src/math/Sphere';
import {Box3} from 'three/src/math/Box3';
import lodash_sortBy from 'lodash/sortBy';
import {CorePoint} from 'src/core/geometry/Point';
// import {CoreMath} from './_Module'
// import OctreeModule from './Octree/_Module';
import {OctreeNode, OctreeNodeTraverseCallback} from './Node';

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
				found_points = lodash_sortBy(found_points, (point) => {
					return point.position().distanceTo(position);
				});
				// const lng_lat = {lng: position.x, lat: position.z}
				// found_points = lodash_sortBy(found_points, (point)=>{
				// 	const src_position = point.position()
				// 	const src_lng_lat = {lng: src_position.x, lat: src_position.z}
				// 	return CoreMath.geodesic_distance(src_lng_lat, lng_lat)
				// });

				found_points = found_points.slice(0, max_points_count);
			}

			return found_points;
		}
	}
}

// Octree.Node = OctreeNode;
