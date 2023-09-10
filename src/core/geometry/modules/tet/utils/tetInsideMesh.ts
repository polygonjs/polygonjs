import {Vector3, BackSide} from 'three';
import {createRaycaster} from '../../../../RaycastHelper';
import {MeshWithBVHGeometry} from '../../../bvh/ThreeMeshBVHHelper';

export const DIRS = [
	new Vector3(1.0, 0.0, 0.0),
	new Vector3(-1.0, 0.0, 0.0),
	new Vector3(0.0, 1.0, 0.0),
	new Vector3(0.0, -1.0, 0.0),
	new Vector3(0.0, 0.0, 1.0),
	new Vector3(0.0, 0.0, -1.0),
];
const _raycaster = createRaycaster();

export function isPositionInsideMesh(pos: Vector3, mesh: MeshWithBVHGeometry, minDist: number): boolean {
	// const {mesh, invMat, p, minDist} = options;

	let numIn: number = 0;
	const bvh = mesh.geometry.boundsTree;
	_raycaster.ray.origin.copy(pos);
	for (const dir of DIRS) {
		_raycaster.ray.direction.copy(dir);
		// raycaster.ray.applyMatrix4(invMat);
		const hit = bvh.raycastFirst(_raycaster.ray, BackSide);
		if (hit) {
			const {normal, distance} = hit;

			if (normal) {
				normal.applyMatrix4(mesh.matrixWorld);
				// we test that the normal is facing the other way as the ray,
				// since the raycast is tested with BackSide.
				// and we can't test with FrontSide as this does not return an intersection
				// nor with DoubleSide as we can't tell if the normal is negated or not
				if (normal.dot(dir) <= 0.0) {
					numIn++;
				}
				if (minDist > 0.0 && distance < minDist) {
					return false;
				}
			}
		}
	}
	return numIn > 4;
}
