import {Object3D, PerspectiveCamera} from 'three';
import {isBooleanTrue} from '../../core/Type';
import {ObjectNamedFunction3, ObjectNamedFunction4} from './_Base';

export class setPerspectiveCameraFov extends ObjectNamedFunction3<[number, number, boolean]> {
	static override type() {
		return 'setPerspectiveCameraFov';
	}
	func(object3D: Object3D, fov: number, lerp: number, updateProjectionMatrix: boolean): void {
		if (!(object3D instanceof PerspectiveCamera)) {
			return;
		}
		const perspectiveCamera = object3D as PerspectiveCamera;
		const newFov = lerp * fov + (1 - lerp) * perspectiveCamera.fov;
		perspectiveCamera.fov = newFov;
		if (isBooleanTrue(updateProjectionMatrix)) {
			perspectiveCamera.updateProjectionMatrix();
		}
	}
}

export class setPerspectiveCameraNearFar extends ObjectNamedFunction4<[number, number, number, boolean]> {
	static override type() {
		return 'setPerspectiveCameraNearFar';
	}
	func(object3D: Object3D, near: number, far: number, lerp: number, updateProjectionMatrix: boolean): void {
		if (!(object3D instanceof PerspectiveCamera)) {
			return;
		}
		const perspectiveCamera = object3D as PerspectiveCamera;
		const newNear = lerp * near + (1 - lerp) * perspectiveCamera.near;
		const newFar = lerp * far + (1 - lerp) * perspectiveCamera.far;
		perspectiveCamera.near = newNear;
		perspectiveCamera.far = newFar;
		if (isBooleanTrue(updateProjectionMatrix)) {
			perspectiveCamera.updateProjectionMatrix();
		}
	}
}
