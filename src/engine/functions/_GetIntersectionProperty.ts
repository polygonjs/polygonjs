import {Intersection, Vector2, Vector3, Object3D} from 'three';
import {NamedFunction1, NamedFunction2, ObjectNamedFunction1} from './_Base';

export class getIntersectionPropertyDistance extends NamedFunction1<[Intersection | undefined]> {
	static override type() {
		return 'getIntersectionPropertyDistance';
	}
	func(intersection: Intersection | undefined): number {
		return intersection?.distance || 0;
	}
}
export class getIntersectionPropertyObject extends ObjectNamedFunction1<[Intersection | undefined]> {
	static override type() {
		return 'getIntersectionPropertyObject';
	}
	func(object3D: Object3D, intersection: Intersection | undefined): Object3D {
		return intersection?.object || object3D;
	}
}
export class getIntersectionPropertyPoint extends NamedFunction2<[Intersection | undefined, Vector3]> {
	static override type() {
		return 'getIntersectionPropertyPoint';
	}
	func(intersection: Intersection | undefined, target: Vector3): Vector3 {
		return intersection ? target.copy(intersection.point) : target.set(0, 0, 0);
	}
}
export class getIntersectionPropertyNormal extends NamedFunction2<[Intersection | undefined, Vector3]> {
	static override type() {
		return 'getIntersectionPropertyNormal';
	}
	func(intersection: Intersection | undefined, target: Vector3): Vector3 {
		if (!intersection) {
			return target.set(0, 1, 0);
		}
		const face = intersection.face;
		if (face && face.normal) {
			target.copy(face.normal);
		} else {
			target.set(0, 1, 0);
		}
		return target;
	}
}
export class getIntersectionPropertyUv extends NamedFunction2<[Intersection | undefined, Vector2]> {
	static override type() {
		return 'getIntersectionPropertyUv';
	}
	func(intersection: Intersection | undefined, target: Vector2): Vector2 {
		return intersection?.uv ? target.copy(intersection.uv) : target.set(0, 0);
	}
}
