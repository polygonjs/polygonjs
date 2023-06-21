import {TetGeometry} from '../TetGeometry';
import {Vector3} from 'three';
import {isPointInTetCircumSphere} from './tetSphere';

const visitedTets = new Set<number>();
const stack: number[] = [];
export function findNonDelaunayTetsFromSinglePointCheck(
	tetGeometry: TetGeometry,
	startTetId: number,
	addedPoint: Vector3,
	invalidTets: number[]
) {
	visitedTets.clear();
	invalidTets.length = 0;
	stack.length = 0;
	stack.push(startTetId);

	while (stack.length > 0) {
		const tetId = stack.pop()!;
		if (visitedTets.has(tetId)) {
			continue;
		}
		visitedTets.add(tetId);
		const tet = tetGeometry.tetrahedrons.get(tetId);

		if (!tet) {
			throw 'tet not found';
			continue;
		}
		invalidTets.push(tetId);

		for (let neighbourData of tet.neighbours) {
			if (neighbourData) {
				if (!visitedTets.has(neighbourData.id)) {
					// delaunay check
					const neighbourTet = tetGeometry.tetrahedrons.get(neighbourData.id);
					if (neighbourTet?.disposed) {
						console.error('is disposed');
						throw 'is disposed';
					}
					if (neighbourTet && isPointInTetCircumSphere(neighbourTet, addedPoint)) {
						stack.push(neighbourTet.id);
					}
				}
			}
		}
	}
}

const badTetIds: Set<number> = new Set();
export function findNonDelaunayTetsFromMultiplePointsCheck(tetGeometry: TetGeometry, invalidTets: number[]) {
	badTetIds.clear();
	tetGeometry.points.forEach((point, pointId) => {
		tetGeometry.tetrahedrons.forEach((tet) => {
			if (!badTetIds.has(tet.id) && !tet.pointIds.includes(pointId)) {
				if (isPointInTetCircumSphere(tet, point.position)) {
					badTetIds.add(tet.id);
					// console.log('tet', tet.id, 'includes point', point.id, '. Its ids are: ', tet.pointIds.join(', '));
				}
			}
		});
	});

	invalidTets.length = 0;
	badTetIds.forEach((tetId) => {
		invalidTets.push(tetId);
	});
}
