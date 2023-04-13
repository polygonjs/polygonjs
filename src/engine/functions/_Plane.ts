import {Plane, Vector3} from 'three';
import {NamedFunction1, NamedFunction2, NamedFunction3} from './_Base';

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

export class getPlaneNormal extends NamedFunction2<[Plane, Vector3]> {
	static override type() {
		return 'getPlaneNormal';
	}
	func(plane: Plane, target: Vector3): Vector3 {
		return target.copy(plane.normal);
	}
}
export class getPlaneConstant extends NamedFunction1<[Plane]> {
	static override type() {
		return 'getPlaneConstant';
	}
	func(plane: Plane): number {
		return plane.constant;
	}
}
