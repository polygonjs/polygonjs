import {Vector3, Ray, Triangle} from 'three';
import {TetGeometry} from '../TetGeometry';
import {tetCenter} from './tetCenter';
import {tetFaceTriangle} from './tetTriangle';
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

function selectRandomUnvisitedTet(tetGeometry: TetGeometry, visitedTets: Set<number>) {
	let selectedTetId: number | null = null;
	tetGeometry.tetrahedrons.forEach((tet, tetId) => {
		if (!visitedTets.has(tetId)) {
			selectedTetId = tetId;
		}
	});
	return selectedTetId;
}

// const MAX_ITERATIONS = 100;
// const rayOrigin = new Vector3()
const _stack = new Set<number>();
export function findTetContainingPosition(
	tetGeometry: TetGeometry,
	position: Vector3,
	rayOrigin: Vector3,
	tetIdOrigin: number
	// maxIterations:number
) {
	_stack.clear();
	let foundTetId: number = tetIdOrigin;
	_stack.add(foundTetId);
	let i = 0;
	// tetCenter(tetGeometry, currentTetId, _ray.origin);
	_ray.origin.copy(rayOrigin);
	_ray.direction.copy(position).sub(_ray.origin);
	const maxIterations = tetGeometry.tetsCount();
	while (i < maxIterations) {
		const nextFaceIndex = findNextFaceIndex(tetGeometry, foundTetId, _ray, _intersectionTarget);
		if (nextFaceIndex == null) {
			// foundTetId = currentTetId;
			break;
		}

		const nextTetId = tetNeighbour(tetGeometry, foundTetId, nextFaceIndex);
		if (nextTetId == null) {
			// if we reach a tet that has no neighbour,
			// we restart from a random other tet
			// that has not yet been visited
			const selectedTetId = selectRandomUnvisitedTet(tetGeometry, _stack);
			if (selectedTetId != null) {
				foundTetId = selectedTetId;
			}
		} else {
			foundTetId = nextTetId;
		}
		_stack.add(foundTetId);

		// update ray
		tetCenter(tetGeometry, foundTetId, _ray.origin);
		// _ray.origin.copy(_intersectionTarget);
		_ray.direction.copy(position).sub(_ray.origin);

		i++;
	}

	// console.log('end', {i, foundTetId});
	return foundTetId;
}
