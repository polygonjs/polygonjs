import {Vector2, Vector3} from 'three';
import {NamedFunction2} from './_Base';

export class dotVector2 extends NamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'dotVector2';
	}
	func(v1: Vector2, v2: Vector2): number {
		return v1.dot(v2);
	}
}

export class dotVector3 extends NamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'dotVector3';
	}
	func(v1: Vector3, v2: Vector3): number {
		return v1.dot(v2);
	}
}
