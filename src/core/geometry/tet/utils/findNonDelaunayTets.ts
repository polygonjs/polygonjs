import {TetGeometry} from '../TetGeometry';
import {Vector3} from 'three';
import {isPointInTetCircumSphere} from './tetSphere';

const visitedTets = new Set<number>();
const stack: number[] = [];
export function findNonDelaunayTets(
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
			continue;
		}
		invalidTets.push(tetId);

		for (let i = 0; i < 4; i++) {
			const neighbourData = tet.neighbours[i];
			if (neighbourData) {
				if (!visitedTets.has(neighbourData.id)) {
					// delaunay check
					const neighbourTet = tetGeometry.tetrahedrons.get(neighbourData.id);
					if (neighbourTet && isPointInTetCircumSphere(neighbourTet, addedPoint)) {
						stack.push(neighbourTet.id);
					}
				}
			}
		}
	}
}
