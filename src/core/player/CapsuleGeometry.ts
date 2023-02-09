import {Vector3} from 'three';
import {RoundedBoxGeometry} from '../../modules/three/examples/jsm/geometries/RoundedBoxGeometry';

export interface CapsuleOptions {
	radius: number;
	height: number;
	divisions: number;
	center: Vector3;
}
export function createCapsuleGeometry(capsuleOptions: CapsuleOptions) {
	const {radius, height, divisions, center} = capsuleOptions;
	const diameter = 2 * radius;
	const bevel = radius;
	const width = diameter;
	const boxHeight = height;
	const geometry = new RoundedBoxGeometry(width, boxHeight + diameter, width, divisions, bevel);
	geometry.translate(center.x, center.y, center.z);
	return geometry;
}
