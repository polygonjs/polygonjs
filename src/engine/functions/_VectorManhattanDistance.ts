import {Vector2, Vector3} from 'three';
import {NamedFunction2} from './_Base';

export class manhattanDistanceVector2 extends NamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'manhattanDistanceVector2';
	}
	func(v1: Vector2, v2: Vector2): number {
		return v1.manhattanDistanceTo(v2);
	}
}

export class manhattanDistanceVector3 extends NamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'manhattanDistanceVector3';
	}
	func(v1: Vector3, v2: Vector3): number {
		return v1.manhattanDistanceTo(v2);
	}
}
