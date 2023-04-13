import {Vector3} from 'three';
import {NamedFunction3} from './_Base';

export class nearestPosition extends NamedFunction3<[Vector3, Array<Vector3>, Vector3]> {
	static override type() {
		return 'nearestPosition';
	}
	func(v3: Vector3, positions: Vector3[], target: Vector3): Vector3 {
		target.set(0, 0, 0);
		if (positions) {
			let currentDist = -1;
			let minDist: number | null = null;
			let nearestPosition: Vector3 | undefined;
			for (let position of positions) {
				currentDist = position.distanceTo(v3);
				if (minDist == null || currentDist < minDist) {
					nearestPosition = position;
					minDist = currentDist;
				}
			}
			if (nearestPosition != null) {
				target.copy(nearestPosition);
			}
		}

		return target;
	}
}
