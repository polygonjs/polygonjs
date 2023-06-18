import {TetGeometry} from '../TetGeometry';
import {Vector3} from 'three';

export function tetCenter(tetGeometry: TetGeometry, tetIndex: number, target: Vector3) {
	const points = tetGeometry.points;
	const tet = tetGeometry.tetrahedrons[tetIndex];
	target.copy(points[tet[0]]).add(points[tet[1]]).add(points[tet[2]]).add(points[tet[3]]).multiplyScalar(0.25);
}
