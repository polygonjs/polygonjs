import {RoundedBoxGeometry} from '../../modules/three/examples/jsm/geometries/RoundedBoxGeometry';

export interface CapsuleOptions {
	radius: number;
	height: number;
	divisions: number;
}
export function createCapsuleGeometry(capsuleOptions: CapsuleOptions) {
	const {radius, height, divisions} = capsuleOptions;
	const diameter = 2 * radius;
	const bevel = radius;
	const width = diameter;
	const boxHeight = height;
	const geometry = new RoundedBoxGeometry(width, boxHeight, width, divisions, bevel);
	// geometry.translate(0, -height / 2, 0);
	return geometry;
}
