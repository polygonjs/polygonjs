import {Object3D, OrthographicCamera, PerspectiveCamera, Vector3, Matrix4} from 'three';
import {NamedFunction2, NamedFunction3} from './_Base';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {getDefaultCamera} from './_Camera';

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
	private _getDefaultCamera: getDefaultCamera | undefined;
	func(src: Vector3, object3D: Object3D, target: Vector3): Vector3 {
		if (object3D == null) {
			this._getDefaultCamera =
				this._getDefaultCamera || new getDefaultCamera(this.node, this.shadersCollectionController);
			object3D = this._getDefaultCamera.func();
		}
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
	private _getDefaultCamera: getDefaultCamera | undefined;
	func(src: Vector3, object3D: Object3D, target: Vector3): Vector3 {
		if (object3D == null) {
			this._getDefaultCamera =
				this._getDefaultCamera || new getDefaultCamera(this.node, this.shadersCollectionController);
			object3D = this._getDefaultCamera.func();
		}
		if (!(object3D instanceof PerspectiveCamera || object3D instanceof OrthographicCamera)) {
			return target;
		}
		// this can't just depend on the matrix,
		// so we need to depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);
		//
		// object3D.updateMatrix();
		// object3D.updateProjectionMatrix();
		target.copy(src);
		target.unproject(object3D);
		return target;
	}
}

export class vector3ApplyMatrix4 extends NamedFunction3<[Vector3, Matrix4, Vector3]> {
	static override type() {
		return 'vector3ApplyMatrix4';
	}
	func(src: Vector3, matrix4: Matrix4, target: Vector3): Vector3 {
		target.copy(src);
		target.applyMatrix4(matrix4);
		return target;
	}
}
