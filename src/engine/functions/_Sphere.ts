import {Sphere, Vector3} from 'three';
import {NamedFunction1, NamedFunction2, NamedFunction3} from './_Base';

export class sphereSet extends NamedFunction3<[Vector3, number, Sphere]> {
	static override type() {
		return 'sphereSet';
	}
	func(center: Vector3, radius: number, target: Sphere): Sphere {
		target.center.copy(center);
		target.radius = radius;
		return target;
	}
}

export class getSphereCenter extends NamedFunction2<[Sphere, Vector3]> {
	static override type() {
		return 'getSphereCenter';
	}
	func(sphere: Sphere, target: Vector3): Vector3 {
		return target.copy(sphere.center);
	}
}
export class getSphereRadius extends NamedFunction1<[Sphere]> {
	static override type() {
		return 'getSphereRadius';
	}
	func(sphere: Sphere): number {
		return sphere.radius;
	}
}
