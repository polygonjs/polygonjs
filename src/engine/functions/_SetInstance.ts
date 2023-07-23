import {Object3D, Vector3, Quaternion, BufferAttribute} from 'three';
import {ObjectNamedFunction3, ObjectNamedFunction4} from './_Base';
import {InstanceAttrib} from '../../core/geometry/Instancer';
import {
	_setPointAttributeVector3Name,
	_setPointAttributeQuaternionName,
	_setPointAttributeVector3MultName,
} from './_SetPoint';
import {quatLookAt} from '../../core/LookAt';
import {Object3DWithGeometry} from '../../core/geometry/Group';
import {markAttributeAsNeedsUpdateForFrame} from '../../core/geometry/Attribute';

const _q = new Quaternion();
const _q2 = new Quaternion();
const _v3 = new Vector3();

export class setPointInstanceLookAt extends ObjectNamedFunction4<[number, Vector3, Vector3, number]> {
	static override type() {
		return 'setPointInstanceLookAt';
	}
	func(object3D: Object3D, ptnum: number, targetPosition: Vector3, up: Vector3, lerp: number): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const positionAttribute = geometry.getAttribute(InstanceAttrib.POSITION) as BufferAttribute | undefined;
		const quaternionAttribute = geometry.getAttribute(InstanceAttrib.QUATERNION) as BufferAttribute | undefined;
		if (!(positionAttribute && quaternionAttribute)) {
			return;
		}
		_v3.fromBufferAttribute(positionAttribute, ptnum);
		quatLookAt(_v3, targetPosition, up, _q);

		if (lerp >= 1) {
			_q.toArray(quaternionAttribute.array as number[], ptnum * 4);
		} else {
			if (!quaternionAttribute) {
				return;
			}
			_q2.fromBufferAttribute(quaternionAttribute, ptnum);
			_q2.slerp(_q, lerp);
			_q2.toArray(quaternionAttribute.array as number[], ptnum * 4);
		}
		markAttributeAsNeedsUpdateForFrame(quaternionAttribute, this.timeController.frame());
	}
}
export class setPointInstancePosition extends ObjectNamedFunction3<[number, Vector3, number]> {
	static override type() {
		return 'setPointInstancePosition';
	}
	func = _setPointAttributeVector3Name(this, InstanceAttrib.POSITION);
}
export class setPointInstanceQuaternion extends ObjectNamedFunction3<[number, Quaternion, number]> {
	static override type() {
		return 'setPointInstanceQuaternion';
	}
	func = _setPointAttributeQuaternionName(this, InstanceAttrib.QUATERNION);
}
export class setPointInstanceScale extends ObjectNamedFunction4<[number, Vector3, number, number]> {
	static override type() {
		return 'setPointInstanceScale';
	}
	func = _setPointAttributeVector3MultName(this, InstanceAttrib.SCALE);
}
