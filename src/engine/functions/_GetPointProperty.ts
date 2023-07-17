import {Mesh, Object3D, Vector2, Vector3, Vector4} from 'three';
import {
	ObjectNamedFunction0,
	ObjectNamedFunction1,
	ObjectNamedFunction2,
	ObjectNamedFunction3,
	ObjectNamedFunction4,
} from './_Base';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {_matchArrayLength} from './_ArrayUtils';
import {Attribute} from '../../core/geometry/Attribute';
import {getObjectPtnumRef} from '../../core/reactivity/PointPropertyReactivity';

//
//
// Single Point
//
//
export class getPointIndex extends ObjectNamedFunction0 {
	static override type() {
		return 'getPointIndex';
	}
	func(object3D: Object3D): number {
		const ref = getObjectPtnumRef(object3D);
		return ref.value;
	}
}
export class setPointIndex extends ObjectNamedFunction1<[number]> {
	static override type() {
		return 'setPointIndex';
	}
	func(object3D: Object3D, ptnum: number): number {
		const ref = getObjectPtnumRef(object3D);
		ref.value = ptnum;
		return ptnum;
	}
}

export class getPointPosition extends ObjectNamedFunction2<[number, Vector3]> {
	static override type() {
		return 'getPointPosition';
	}
	func(object3D: Object3D, ptnum: number, target: Vector3): Vector3 {
		dummyReadRefVal(this.timeController.timeUniform().value);
		if (!(object3D as Mesh).geometry) {
			target.set(0, 0, 0);
			return target;
		}
		const positionAttribute = (object3D as Mesh).geometry.getAttribute(Attribute.POSITION);
		target.fromBufferAttribute(positionAttribute, ptnum);
		return target;
	}
}
export class getPointAttributeNumber extends ObjectNamedFunction3<[number, string, number]> {
	static override type() {
		return 'getPointAttributeNumber';
	}
	func(object3D: Object3D, ptnum: number, attribName: string, defaultValue: number): number {
		dummyReadRefVal(this.timeController.timeUniform().value);
		const attribute = (object3D as Mesh).geometry.getAttribute(attribName);
		if (!attribute) {
			return defaultValue;
		}
		return attribute.array[ptnum];
	}
}
export class getPointAttributeVector2 extends ObjectNamedFunction4<[number, string, Vector2, Vector2]> {
	static override type() {
		return 'getPointAttributeVector2';
	}
	func(object3D: Object3D, ptnum: number, attribName: string, defaultValue: Vector2, target: Vector2): Vector2 {
		dummyReadRefVal(this.timeController.timeUniform().value);
		const attribute = (object3D as Mesh).geometry.getAttribute(attribName);
		if (!attribute) {
			target.copy(defaultValue);
			return target;
		}
		target.fromArray(attribute.array, ptnum * 2);
		return target;
	}
}

export class getPointAttributeVector3 extends ObjectNamedFunction4<[number, string, Vector3, Vector3]> {
	static override type() {
		return 'getPointAttributeVector3';
	}
	func(object3D: Object3D, ptnum: number, attribName: string, defaultValue: Vector3, target: Vector3): Vector3 {
		dummyReadRefVal(this.timeController.timeUniform().value);
		const attribute = (object3D as Mesh).geometry.getAttribute(attribName);
		if (!attribute) {
			target.copy(defaultValue);
			return target;
		}
		target.fromArray(attribute.array, ptnum * 3);
		return target;
	}
}
export class getPointAttributeVector4 extends ObjectNamedFunction4<[number, string, Vector4, Vector4]> {
	static override type() {
		return 'getPointAttributeVector4';
	}
	func(object3D: Object3D, ptnum: number, attribName: string, defaultValue: Vector4, target: Vector4): Vector4 {
		dummyReadRefVal(this.timeController.timeUniform().value);
		const attribute = (object3D as Mesh).geometry.getAttribute(attribName);
		if (!attribute) {
			target.copy(defaultValue);
			return target;
		}
		target.fromArray(attribute.array, ptnum * 4);
		return target;
	}
}
