import {Vector3, Ray, Triangle} from 'three';
import {TetGeometry} from '../TetGeometry';
import {tetCenter} from './tetCenter';
import {tetFaceTriangle} from './tetFaceTriangle';
import {tetNeighbour} from './tetNeighboursHelper';

const _ray = new Ray();
const _triangle = new Triangle();
const _intersectionTarget = new Vector3();

function findNextFaceIndex(
	tetGeometry: TetGeometry,
	tetIndex: number,
	ray: Ray,
	intersectionTarget: Vector3
): number | null {
	for (let faceIndex = 0; faceIndex < 4; faceIndex++) {
		tetFaceTriangle(tetGeometry, tetIndex, faceIndex, _triangle);
		const intersection = ray.intersectTriangle(_triangle.c, _triangle.b, _triangle.a, false, intersectionTarget);
		if (intersection != null) {
			// if we have an intersection, we check that the distance to it is less than the ray length
			if (intersection.distanceTo(ray.origin) <= ray.direction.length()) {
				return faceIndex;
			}
		}
	}
	return null;
}

// export function _findTetContainingPosition(
// 	tetGeometry: TetGeometry,
// 	position: Vector3,
// 	currentTetId: number = 0,
// 	rayOrigin?: Vector3
// ): number | undefined {
// 	console.log('findTetContainingPosition', {currentTetId, pos: position.toArray().join(',')});
// 	if (!rayOrigin) {
// 		tetCenter(tetGeometry, currentTetId, ray.origin);
// 	} else {
// 		ray.origin.copy(rayOrigin);
// 	}
// 	ray.direction.copy(position).sub(ray.origin);

// 	const nextFaceIndex = findNextFaceIndex(tetGeometry, currentTetId, ray);
// 	console.log({currentTetId, nextFaceIndex});
// 	if (nextFaceIndex == null) {
// 		return currentTetId;
// 	}
// 	const nextTet = tetNeighbour(tetGeometry, currentTetId, nextFaceIndex);
// 	console.log({nextTet});
// 	if (nextTet != null) {
// 		return _findTetContainingPosition(tetGeometry, position, nextTet, intersectionTarget);
// 	}
// }

const MAX_ITERATIONS = 10;
// const rayOrigin = new Vector3()
export function findTetContainingPosition(tetGeometry: TetGeometry, position: Vector3, currentTetId: number) {
	// let foundTetId: number | null = null;
	let i = 0;
	tetCenter(tetGeometry, currentTetId, _ray.origin);
	_ray.direction.copy(position).sub(_ray.origin);
	while (i < MAX_ITERATIONS) {
		const nextFaceIndex = findNextFaceIndex(tetGeometry, currentTetId, _ray, _intersectionTarget);
		if (nextFaceIndex == null) {
			// foundTetId = currentTetId;
			break;
		}

		const nextTetId = tetNeighbour(tetGeometry, currentTetId, nextFaceIndex);
		if (nextTetId == null) {
			// foundTetId = currentTetId;
			break;
		}
		currentTetId = nextTetId;

		// update ray
		tetCenter(tetGeometry, currentTetId, _ray.origin);
		// _ray.origin.copy(_intersectionTarget);
		_ray.direction.copy(position).sub(_ray.origin);

		i++;
	}

	console.log('end', {i, currentTetId});
	return currentTetId;
}
