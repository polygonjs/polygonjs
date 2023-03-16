import {Vector3} from 'three';

export function sdSphere(p: Vector3, s: number): number {
	return p.length() - s;
}
