import {RoundedBoxGeometry} from '../../modules/three/examples/jsm/geometries/RoundedBoxGeometry';

export interface CapsuleOptions {
	radius: number;
	height: number;
}
export function createPlayerGeometry(capsuleOptions: CapsuleOptions) {
	const radius = capsuleOptions.radius;
	const height = capsuleOptions.height;
	const diameter = 2 * radius;
	const bevel = radius;
	const divisions = 10;
	const geometry = new RoundedBoxGeometry(diameter, height + diameter, diameter, divisions, bevel);
	geometry.translate(0, -height / 2, 0);
	return geometry;
}
