import {Object3D, OrthographicCamera, PerspectiveCamera, Vector3} from 'three';
import {NamedFunction2, NamedFunction3} from './_Base';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';

export class vector3AngleTo extends NamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'vector3AngleTo';
	}
	func(v1: Vector3, v2: Vector3): number {
		return v1.angleTo(v2);
	}
}
export class vector3ProjectOnPlane extends NamedFunction3<[Vector3, Vector3, Vector3]> {
	static override type() {
		return 'vector3ProjectOnPlane';
	}
	func(src: Vector3, planeNormal: Vector3, target: Vector3): Vector3 {
		target.copy(src);
		target.projectOnPlane(planeNormal);
		return target;
	}
}
export class vector3Project extends NamedFunction3<[Vector3, Object3D, Vector3]> {
	static override type() {
		return 'vector3Project';
	}
	func(src: Vector3, object3D: Object3D, target: Vector3): Vector3 {
		if (!(object3D instanceof PerspectiveCamera || object3D instanceof OrthographicCamera)) {
			return target;
		}
		// this can't just depend on the matrix,
		// so we need to depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);
		//
		target.copy(src);
		target.project(object3D);
		return target;
	}
}
export class vector3Unproject extends NamedFunction3<[Vector3, Object3D, Vector3]> {
	static override type() {
		return 'vector3Unproject';
	}
	func(src: Vector3, object3D: Object3D, target: Vector3): Vector3 {
		if (!(object3D instanceof PerspectiveCamera || object3D instanceof OrthographicCamera)) {
			return target;
		}
		// this can't just depend on the matrix,
		// so we need to depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);
		//
		target.copy(src);
		target.unproject(object3D);
		return target;
	}
}
