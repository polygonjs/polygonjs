import {Ray, Plane, Vector3} from 'three';
import {NamedFunction3} from '../code/assemblers/NamedFunction';

export class rayIntersectPlane extends NamedFunction3<[Ray, Plane, Vector3]> {
	type = 'rayIntersectPlane';
	func(ray: Ray, plane: Plane, target: Vector3): Vector3 {
		ray.intersectPlane(plane, target);
		return target;
	}
}
