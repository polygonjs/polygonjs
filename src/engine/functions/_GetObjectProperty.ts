import {Mesh, Object3D, Quaternion, Vector3} from 'three';
import {ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';
import {getObjectPropertyRef, PropertyType} from '../../core/reactivity/ObjectPropertyReactivity';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {_matchArrayLength} from './_ArrayUtils';
import {getObjectChildrenCountRef} from '../../core/reactivity/ObjectHierarchyReactivity';

//
//
// Single Object
//
//
export class getObjectProperty extends ObjectNamedFunction1<[string]> {
	static override type() {
		return 'getObjectProperty';
	}
	func<K extends keyof PropertyType>(object3D: Object3D, propertyName: K): PropertyType[K] {
		dummyReadRefVal(getObjectPropertyRef(object3D, propertyName).value);
		return (object3D as Mesh)[propertyName] as PropertyType[K];
	}
}
export class getObjectWorldPosition extends ObjectNamedFunction1<[Vector3]> {
	static override type() {
		return 'getObjectWorldPosition';
	}
	func(object3D: Object3D, target: Vector3): Vector3 {
		// this can't just depend on the matrix,
		// so we need to depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);

		//
		object3D.getWorldPosition(target);
		return target;
	}
}

export class object3DLocalToWorld extends ObjectNamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'object3DLocalToWorld';
	}
	func(object3D: Object3D, position: Vector3, target: Vector3): Vector3 {
		// this can't just depend on the matrix,
		// so we need to depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);

		//
		target.copy(position);
		object3D.localToWorld(target);
		return target;
	}
}
export class object3DWorldToLocal extends ObjectNamedFunction2<[Vector3, Vector3]> {
	static override type() {
		return 'object3DWorldToLocal';
	}
	func(object3D: Object3D, position: Vector3, target: Vector3): Vector3 {
		// this can't just depend on the matrix,
		// so we need to depend on time for now
		dummyReadRefVal(this.timeController.timeUniform().value);

		//
		target.copy(position);
		object3D.worldToLocal(target);
		return target;
	}
}

//
//
// Generics
//
//

function _getChildrenPropertiesVector3(propertyName: 'position' | 'scale' | 'up') {
	return function (object3D: Object3D, targets: Vector3[]): Vector3[] {
		dummyReadRefVal(getObjectChildrenCountRef(object3D).value);
		_matchArrayLength(object3D.children, targets, () => new Vector3());
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			dummyReadRefVal(getObjectPropertyRef(child, propertyName).value);
			targets[i].copy(child[propertyName]);
			i++;
		}
		return targets;
	};
}
function _getChildrenPropertiesQuaternion(propertyName: 'quaternion') {
	return function (object3D: Object3D, targets: Quaternion[]): Quaternion[] {
		dummyReadRefVal(getObjectChildrenCountRef(object3D).value);
		_matchArrayLength(object3D.children, targets, () => new Quaternion());
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			dummyReadRefVal(getObjectPropertyRef(child, propertyName).value);
			targets[i].copy(child[propertyName]);
			i++;
		}
		return targets;
	};
}
function _getChildrenPropertiesBoolean(
	propertyName: 'visible' | 'matrixAutoUpdate' | 'castShadow' | 'receiveShadow' | 'frustumCulled'
) {
	return function (object3D: Object3D, targets: boolean[]): boolean[] {
		dummyReadRefVal(getObjectChildrenCountRef(object3D).value);
		_matchArrayLength(object3D.children, targets, () => false);
		let i = 0;
		const children = object3D.children;
		for (let child of children) {
			dummyReadRefVal(getObjectPropertyRef(child, propertyName).value);
			targets[i] = child[propertyName];
			i++;
		}
		return targets;
	};
}

//
//
// Children
//
//

export class getChildrenPropertiesPosition extends ObjectNamedFunction1<[Array<Vector3>]> {
	static override type() {
		return 'getChildrenPropertiesPosition';
	}
	func = _getChildrenPropertiesVector3('position');
}
export class getChildrenPropertiesQuaternion extends ObjectNamedFunction1<[Array<Quaternion>]> {
	static override type() {
		return 'getChildrenPropertiesQuaternion';
	}
	func = _getChildrenPropertiesQuaternion('quaternion');
}

export class getChildrenPropertiesScale extends ObjectNamedFunction1<[Array<Vector3>]> {
	static override type() {
		return 'getChildrenPropertiesScale';
	}
	func = _getChildrenPropertiesVector3('scale');
}
export class getChildrenPropertiesUp extends ObjectNamedFunction1<[Array<Vector3>]> {
	static override type() {
		return 'getChildrenPropertiesUp';
	}
	func = _getChildrenPropertiesVector3('up');
}

export class getChildrenPropertiesVisible extends ObjectNamedFunction1<[Array<boolean>]> {
	static override type() {
		return 'getChildrenPropertiesVisible';
	}
	func = _getChildrenPropertiesBoolean('visible');
}

export class getChildrenPropertiesMatrixAutoUpdate extends ObjectNamedFunction1<[Array<boolean>]> {
	static override type() {
		return 'getChildrenPropertiesMatrixAutoUpdate';
	}
	func = _getChildrenPropertiesBoolean('matrixAutoUpdate');
}
export class getChildrenPropertiesCastShadow extends ObjectNamedFunction1<[Array<boolean>]> {
	static override type() {
		return 'getChildrenPropertiesCastShadow';
	}
	func = _getChildrenPropertiesBoolean('castShadow');
}
export class getChildrenPropertiesReceiveShadow extends ObjectNamedFunction1<[Array<boolean>]> {
	static override type() {
		return 'getChildrenPropertiesReceiveShadow';
	}
	func = _getChildrenPropertiesBoolean('receiveShadow');
}
export class getChildrenPropertiesFrustumCulled extends ObjectNamedFunction1<[Array<boolean>]> {
	static override type() {
		return 'getChildrenPropertiesFrustumCulled';
	}
	func = _getChildrenPropertiesBoolean('frustumCulled');
}
