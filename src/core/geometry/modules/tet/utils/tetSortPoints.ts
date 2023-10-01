import {TetGeometry} from '../TetGeometry';

export function tetSortPoints(tetGeometry: TetGeometry, pointIndexById: Map<number, number>) {
	pointIndexById.clear();
	let index = 0;
	tetGeometry.points.forEach((point) => {
		if (!pointIndexById.has(point.id)) {
			pointIndexById.set(point.id, index);
			index++;
		}
	});
}
