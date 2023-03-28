import {Plane, Vector3} from 'three';
import {NamedFunction3} from './_Base';

export class planeSet extends NamedFunction3<[Vector3, number, Plane]> {
	static override type() {
		return 'planeSet';
	}
	func(normal: Vector3, constant: number, target: Plane): Plane {
		target.normal.copy(normal);
		target.constant = constant;
		return target;
	}
}
