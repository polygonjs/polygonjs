import {Ray, Plane, Vector3} from 'three';
import {NamedFunction3} from './_Base';

export class rayIntersectPlane extends NamedFunction3<[Ray, Plane, Vector3]> {
	static override type() {
		return 'rayIntersectPlane';
	}
	func(ray: Ray, plane: Plane, target: Vector3): Vector3 {
		ray.intersectPlane(plane, target);
		return target;
	}
}
