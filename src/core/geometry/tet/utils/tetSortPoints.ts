import {TetGeometry} from '../TetGeometry';

export function tetSortPoints(tetGeometry: TetGeometry, pointIndexById: Map<number, number>) {
	pointIndexById.clear();
	let index = 0;
	tetGeometry.tetrahedrons.forEach((tet) => {
		for (const pointId of tet.pointIds) {
			if (!pointIndexById.has(pointId)) {
				pointIndexById.set(pointId, index);
				index++;
			}
		}
	});
}
