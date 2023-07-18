import {
	Ray,
	Plane,
	Vector3,
	Box3,
	Sphere,
	Raycaster,
	Object3D,
	Intersection,
	PerspectiveCamera,
	OrthographicCamera,
	Vector2,
} from 'three';
import {ObjectNamedFunction3, NamedFunction2, NamedFunction3} from './_Base';
import {getDefaultCamera} from './_Camera';

const raycaster = new Raycaster();
const DEFAULT_POS = new Vector3();
const DEFAULT_INTERSECTION: Intersection = {
	distance: -1,
	point: DEFAULT_POS,
	object: new Object3D(),
};
const tmpV2 = new Vector2();

export class raySet extends NamedFunction3<[Vector3, Vector3, Ray]> {
	static override type() {
		return 'raySet';
	}
	func(origin: Vector3, direction: Vector3, target: Ray): Ray {
		target.origin.copy(origin);
		target.direction.copy(direction);
		return target;
	}
}

//
//
// Ray From Camera
//
//
export class rayFromCamera extends ObjectNamedFunction3<[number, number, Ray]> {
	static override type() {
		return 'rayFromCamera';
	}
	private _getDefaultCamera: getDefaultCamera | undefined;
	func(object3D: Object3D, x: number, y: number, target: Ray): Ray {
		if (object3D == null) {
			this._getDefaultCamera =
				this._getDefaultCamera || new getDefaultCamera(this.node, this.shadersCollectionController);
			object3D = this._getDefaultCamera.func();
		}

		if (!(object3D instanceof PerspectiveCamera || object3D instanceof OrthographicCamera)) {
			return target;
		}
		tmpV2.set(x, y);
		raycaster.setFromCamera(tmpV2, object3D);
		target.copy(raycaster.ray);
		return target;
	}
}

//
//
// Ray Property
//
//
export class getRayOrigin extends NamedFunction2<[Ray, Vector3]> {
	static override type() {
		return 'getRayOrigin';
	}
	func(ray: Ray, target: Vector3): Vector3 {
		return target.copy(ray.origin);
	}
}
export class getRayDirection extends NamedFunction2<[Ray, Vector3]> {
	static override type() {
		return 'getRayDirection';
	}
	func(ray: Ray, target: Vector3): Vector3 {
		return target.copy(ray.direction);
	}
}

//
//
// Box3
//
//
export class rayIntersectBox3 extends NamedFunction3<[Ray, Box3, Vector3]> {
	static override type() {
		return 'rayIntersectBox3';
	}
	func(ray: Ray, box: Box3, target: Vector3): Vector3 {
		ray.intersectBox(box, target);
		return target;
	}
}
export class rayIntersectsBox3 extends NamedFunction2<[Ray, Box3]> {
	static override type() {
		return 'rayIntersectsBox3';
	}
	func(ray: Ray, box: Box3): boolean {
		return ray.intersectsBox(box);
	}
}

//
//
// Object3D
//
//

function _defaultIntersection(object3D: Object3D): Intersection {
	DEFAULT_INTERSECTION.object = object3D;
	return DEFAULT_INTERSECTION;
}
export class rayIntersectObject3D extends NamedFunction3<[Ray, Object3D, boolean]> {
	static override type() {
		return 'rayIntersectObject3D';
	}
	func(ray: Ray, object3D: Object3D, recursive: boolean): Intersection {
		raycaster.ray.copy(ray);
		const intersections = raycaster.intersectObject(object3D, recursive);
		return intersections[0] || _defaultIntersection(object3D);
	}
}
export class rayIntersectsObject3D extends NamedFunction3<[Ray, Object3D, boolean]> {
	static override type() {
		return 'rayIntersectsObject3D';
	}
	func(ray: Ray, object3D: Object3D, recursive: boolean): boolean {
		raycaster.ray.copy(ray);
		const intersections = raycaster.intersectObject(object3D, recursive);
		return intersections.length > 0;
	}
}

//
//
// Plane
//
//

export class rayIntersectPlane extends NamedFunction3<[Ray, Plane, Vector3]> {
	static override type() {
		return 'rayIntersectPlane';
	}
	func(ray: Ray, plane: Plane, target: Vector3): Vector3 {
		ray.intersectPlane(plane, target);
		return target;
	}
}
export class rayIntersectsPlane extends NamedFunction2<[Ray, Plane]> {
	static override type() {
		return 'rayIntersectsPlane';
	}
	func(ray: Ray, plane: Plane): boolean {
		return ray.intersectsPlane(plane);
	}
}
export class rayDistanceToPlane extends NamedFunction2<[Ray, Plane]> {
	static override type() {
		return 'rayDistanceToPlane';
	}
	func(ray: Ray, plane: Plane): number {
		return ray.distanceToPlane(plane);
	}
}

//
//
// Sphere
//
//

export class rayIntersectSphere extends NamedFunction3<[Ray, Sphere, Vector3]> {
	static override type() {
		return 'rayIntersectSphere';
	}
	func(ray: Ray, sphere: Sphere, target: Vector3): Vector3 {
		ray.intersectSphere(sphere, target);
		return target;
	}
}
export class rayIntersectsSphere extends NamedFunction2<[Ray, Sphere]> {
	static override type() {
		return 'rayIntersectsSphere';
	}
	func(ray: Ray, sphere: Sphere): boolean {
		return ray.intersectsSphere(sphere);
	}
}
