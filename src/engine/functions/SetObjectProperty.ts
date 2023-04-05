import {Matrix4, Object3D} from 'three';
import {touchObjectProperty, GetObjectPropertyJsNodeInputName} from '../../core/reactivity/ObjectPropertyReactivity';
import {ObjectNamedFunction0, ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';

export class setObjectCastShadow extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'setObjectCastShadow';
	}
	func(object3D: Object3D, castShadow: boolean): void {
		object3D.castShadow = castShadow;
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.castShadow);
	}
}
export class setObjectReceiveShadow extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'setObjectReceiveShadow';
	}
	func(object3D: Object3D, receiveShadow: boolean): void {
		object3D.receiveShadow = receiveShadow;
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.receiveShadow);
	}
}
export class setObjectFrustumCulled extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'setObjectFrustumCulled';
	}
	func(object3D: Object3D, frustumCulled: boolean): void {
		object3D.frustumCulled = frustumCulled;
		touchObjectProperty(object3D, 'frustumCulled');
	}
}
export class setObjectMatrix extends ObjectNamedFunction1<[Matrix4]> {
	static override type() {
		return 'setObjectMatrix';
	}
	func(object3D: Object3D, matrix: Matrix4): void {
		object3D.matrix.copy(matrix);
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.matrix);
	}
}
export class setObjectMatrixAutoUpdate extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'setObjectMatrixAutoUpdate';
	}
	func(object3D: Object3D, matrixAutoUpdate: boolean): void {
		object3D.matrixAutoUpdate = matrixAutoUpdate;
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.matrixAutoUpdate);
	}
}

export class setObjectVisible extends ObjectNamedFunction1<[boolean]> {
	static override type() {
		return 'setObjectVisible';
	}
	func(object3D: Object3D, visible: boolean): void {
		object3D.visible = visible;
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.visible);
	}
}

export class objectUpdateMatrix extends ObjectNamedFunction0 {
	static override type() {
		return 'objectUpdateMatrix';
	}
	func(object3D: Object3D): void {
		object3D.updateMatrix();
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.matrix);
	}
}
export class objectUpdateWorldMatrix extends ObjectNamedFunction2<[boolean, boolean]> {
	static override type() {
		return 'objectUpdateWorldMatrix';
	}
	func(object3D: Object3D, updateParents: boolean, updateChildren: boolean): void {
		object3D.updateWorldMatrix(updateParents, updateChildren);
		touchObjectProperty(object3D, GetObjectPropertyJsNodeInputName.matrix);
	}
}
