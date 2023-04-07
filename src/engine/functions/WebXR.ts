import {NamedFunction0, NamedFunction1, ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';
import {_matchArrayLength} from './_ArrayUtils';
import {Matrix4, Object3D, Quaternion, Ray, Vector3} from 'three';
import {Poly} from '../Poly';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {getOrCreateWebXRTrackerRef} from '../../core/reactivity/WebXRTrackedMarker';

//
//
// Session
//
//
export class getWebXRARHitDetected extends NamedFunction0 {
	static override type() {
		return 'getWebXRARHitDetected';
	}
	func(): boolean {
		const arController = this.scene.webXR.activeARController();
		return arController?.hitDetected() || false;
	}
}
export class getWebXRARHitMatrix extends NamedFunction1<[Matrix4]> {
	static override type() {
		return 'getWebXRARHitMatrix';
	}
	func(target: Matrix4): Matrix4 {
		const arController = this.scene.webXR.activeARController();
		arController?.hitMatrix(target);
		return target;
	}
}
export class getWebXRARHitPosition extends NamedFunction1<[Vector3]> {
	static override type() {
		return 'getWebXRARHitPosition';
	}
	func(target: Vector3): Vector3 {
		const arController = this.scene.webXR.activeARController();
		arController?.hitPosition(target);
		return target;
	}
}
export class getWebXRARHitQuaternion extends NamedFunction1<[Quaternion]> {
	static override type() {
		return 'getWebXRARHitQuaternion';
	}
	func(target: Quaternion): Quaternion {
		const arController = this.scene.webXR.activeARController();
		arController?.hitQuaternion(target);
		return target;
	}
}

//
//
// Controller
//
//
export class getWebXRControllerObject extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'getWebXRControllerObject';
	}
	func(object3D: Object3D, controllerIndex: number): Object3D {
		const xrController = this.scene.webXR.activeXRController();
		return xrController?.getController(controllerIndex).controller || object3D;
	}
}
export class getWebXRControllerRay extends ObjectNamedFunction2<[number, Ray]> {
	static override type() {
		return 'getWebXRControllerRay';
	}
	func(object3D: Object3D, controllerIndex: number, target: Ray): Ray {
		const xrController = this.scene.webXR.activeXRController();
		const ray = xrController?.getController(controllerIndex).ray;
		if (ray) {
			target.copy(ray);
		}
		return target;
	}
}
export class getWebXRControllerHasAngularVelocity extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'getWebXRControllerHasAngularVelocity';
	}
	func(object3D: Object3D, controllerIndex: number): boolean {
		const xrController = this.scene.webXR.activeXRController();
		return xrController?.getController(controllerIndex).controller.hasAngularVelocity || false;
	}
}
export class getWebXRControllerAngularVelocity extends ObjectNamedFunction2<[number, Vector3]> {
	static override type() {
		return 'getWebXRControllerAngularVelocity';
	}
	func(object3D: Object3D, controllerIndex: number, target: Vector3): Vector3 {
		const xrController = this.scene.webXR.activeXRController();
		const angularVelocity = xrController?.getController(controllerIndex).controller.angularVelocity;
		if (angularVelocity) {
			target.copy(angularVelocity);
		}
		return target;
	}
}
export class getWebXRControllerHasLinearVelocity extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'getWebXRControllerHasLinearVelocity';
	}
	func(object3D: Object3D, controllerIndex: number): boolean {
		const xrController = this.scene.webXR.activeXRController();
		return xrController?.getController(controllerIndex).controller.hasLinearVelocity || false;
	}
}
export class getWebXRControllerLinearVelocity extends ObjectNamedFunction2<[number, Vector3]> {
	static override type() {
		return 'getWebXRControllerLinearVelocity';
	}
	func(object3D: Object3D, controllerIndex: number, target: Vector3): Vector3 {
		const xrController = this.scene.webXR.activeXRController();
		const linearVelocity = xrController?.getController(controllerIndex).controller.linearVelocity;
		if (linearVelocity) {
			target.copy(linearVelocity);
		}
		return target;
	}
}

//
//
// Tracked Markers
//
//
export class getWebXRTrackedMarkerMatrix extends NamedFunction1<[Matrix4]> {
	static override type() {
		return 'getWebXRTrackedMarkerMatrix';
	}
	func(target: Matrix4): Matrix4 {
		const controller = Poly.thirdParty.markerTracking().controller();
		if (controller) {
			dummyReadRefVal(getOrCreateWebXRTrackerRef(0).value);
			controller.trackedMatrix(target);
		} else {
			target.identity();
		}
		return target;
	}
}
