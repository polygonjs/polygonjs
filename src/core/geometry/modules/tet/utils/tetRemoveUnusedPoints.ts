import {TetGeometry} from '../TetGeometry';

export function tetRemoveUnusedPoints(tetGeometry: TetGeometry): TetGeometry {
	const usedPointIds = new Set<number>();
	tetGeometry.tetrahedrons.forEach((tet) => {
		tet.pointIds.forEach((pointId) => {
			usedPointIds.add(pointId);
		});
	});
	tetGeometry.points.forEach((point, pointId) => {
		if (!usedPointIds.has(pointId)) {
			tetGeometry.removePoint(pointId);
		}
	});
	return tetGeometry;
}
