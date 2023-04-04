import {Vector2, Vector3} from 'three';
import {NamedFunction2} from './_Base';

export class distanceVector2 extends NamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'distanceVector2';
	}
	func(v1: Vector2, v2: Vector2): number {
		return v1.distanceTo(v2);
	}
}

export class distanceVector3 extends NamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'distanceVector3';
	}
	func(v1: Vector3, v2: Vector3): number {
		return v1.distanceTo(v2);
	}
}
