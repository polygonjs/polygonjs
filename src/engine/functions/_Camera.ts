import {Camera, Object3D, OrthographicCamera, PerspectiveCamera, Vector2} from 'three';
import {isBooleanTrue} from '../../core/Type';
import {NamedFunction0, ObjectNamedFunction2, ObjectNamedFunction3, ObjectNamedFunction4} from './_Base';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {coreGetDefaultCamera} from '../../core/render/renderPixel/CoreGetDefautCamera';

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

export class getDefaultCamera extends NamedFunction0 {
	static override type() {
		return 'getDefaultCamera';
	}
	func(): Camera {
		// this can't just depend on the matrix,
		// so we need to depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);
		//
		return coreGetDefaultCamera(this.scene);
	}
}

export class setCameraViewOffset extends ObjectNamedFunction2<[Vector2, Vector2]> {
	static override type() {
		return 'setCameraViewOffset';
	}
	func(object3D: Object3D, min: Vector2, max: Vector2): void {
		if (!(object3D instanceof PerspectiveCamera || object3D instanceof OrthographicCamera)) {
			return;
		}
		const viewer = this.scene.viewersRegister.lastRenderedViewer();
		if (!viewer) {
			return;
		}
		const camera = object3D as PerspectiveCamera | OrthographicCamera;
		const size = viewer.camerasController().size;
		camera.setViewOffset(size.x, size.y, size.x * min.x, size.y * min.y, size.x * max.x, size.y * max.y);
	}
}
