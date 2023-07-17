import {Mesh, Object3D, Vector3} from 'three';
import {ObjectNamedFunction0, ObjectNamedFunction1, ObjectNamedFunction2} from './_Base';
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
