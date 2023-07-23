import {Mesh, Object3D, Quaternion, Vector3} from 'three';
import {ObjectNamedFunction2} from './_Base';
import {dummyReadRefVal} from '../../core/reactivity/CoreReactivity';
import {_matchArrayLength} from './_ArrayUtils';
import {InstanceAttrib} from '../../core/geometry/Instancer';

//
//
// Single Point
//
//

export class getPointInstancePosition extends ObjectNamedFunction2<[number, Vector3]> {
	static override type() {
		return 'getPointInstancePosition';
	}
	func(object3D: Object3D, ptnum: number, target: Vector3): Vector3 {
		dummyReadRefVal(this.timeController.timeUniform().value);
		if (!(object3D as Mesh).geometry) {
			target.set(0, 0, 0);
			return target;
		}
		const positionAttribute = (object3D as Mesh).geometry.getAttribute(InstanceAttrib.POSITION);
		target.fromBufferAttribute(positionAttribute, ptnum);
		return target;
	}
}
export class getPointInstanceQuaternion extends ObjectNamedFunction2<[number, Quaternion]> {
	static override type() {
		return 'getPointInstanceQuaternion';
	}
	func(object3D: Object3D, ptnum: number, target: Quaternion): Quaternion {
		dummyReadRefVal(this.timeController.timeUniform().value);
		if (!(object3D as Mesh).geometry) {
			target.identity();
			return target;
		}
		const positionAttribute = (object3D as Mesh).geometry.getAttribute(InstanceAttrib.QUATERNION);
		target.fromBufferAttribute(positionAttribute, ptnum);
		return target;
	}
}
export class getPointInstanceScale extends ObjectNamedFunction2<[number, Vector3]> {
	static override type() {
		return 'getPointInstanceScale';
	}
	func(object3D: Object3D, ptnum: number, target: Vector3): Vector3 {
		dummyReadRefVal(this.timeController.timeUniform().value);
		if (!(object3D as Mesh).geometry) {
			target.set(0, 0, 0);
			return target;
		}
		const positionAttribute = (object3D as Mesh).geometry.getAttribute(InstanceAttrib.SCALE);
		target.fromBufferAttribute(positionAttribute, ptnum);
		return target;
	}
}
