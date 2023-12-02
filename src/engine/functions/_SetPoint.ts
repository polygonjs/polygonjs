import {BufferAttribute, Object3D, Color, Quaternion, Vector2, Vector3, Vector4, InstancedBufferAttribute} from 'three';
import {BaseNamedFunction, ObjectNamedFunction3, ObjectNamedFunction4} from './_Base';
import {Object3DWithGeometry} from '../../core/geometry/Group';
import {Attribute, markAttributeAsNeedsUpdateForFrame} from '../../core/geometry/Attribute';

const _c = new Color();
const _q = new Quaternion();
const _v2 = new Vector2();
const _v3 = new Vector3();
const _v3m = new Vector3();
const _v4 = new Vector4();

export function _setPointAttributeVector3Name(namedFunction: BaseNamedFunction, attribName: string) {
	return function (object3D: Object3D, ptnum: number, newValue: Vector3, lerp: number): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName) as BufferAttribute | InstancedBufferAttribute | undefined;
		if (!attribute) {
			return;
		}
		if (lerp >= 1) {
			newValue.toArray(attribute.array, ptnum * 3);
		} else {
			_v3.fromBufferAttribute(attribute, ptnum);
			_v3.lerp(newValue, lerp);
			_v3.toArray(attribute.array, ptnum * 3);
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}
export function _setPointAttributeVector3MultName(namedFunction: BaseNamedFunction, attribName: string) {
	return function (object3D: Object3D, ptnum: number, newValue: Vector3, mult: number, lerp: number): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!attribute) {
			return;
		}
		_v3m.copy(newValue).multiplyScalar(mult);
		if (lerp >= 1) {
			_v3m.toArray(attribute.array, ptnum * 3);
		} else {
			_v3.fromBufferAttribute(attribute, ptnum);
			_v3.lerp(_v3m, lerp);
			_v3.toArray(attribute.array, ptnum * 3);
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}
export function _setPointAttributeQuaternionName(namedFunction: BaseNamedFunction, attribName: string) {
	return function (object3D: Object3D, ptnum: number, newValue: Quaternion, lerp: number): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!attribute) {
			return;
		}
		if (lerp >= 1) {
			newValue.toArray(attribute.array, ptnum * 4);
		} else {
			_q.fromBufferAttribute(attribute, ptnum);
			_q.slerp(newValue, lerp);
			_q.toArray(attribute.array, ptnum * 4);
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}
export function _setPointAttributeNumberForNamedFunction(namedFunction: BaseNamedFunction) {
	return function _setPointAttributeNumber(
		object3D: Object3D,
		attribName: string,
		ptnum: number,
		newValue: number,
		lerp: number
	): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName);
		if (!attribute) {
			return;
		}
		if (lerp >= 1) {
			attribute.array[ptnum] = newValue;
		} else {
			const oldValue = attribute.array[ptnum];
			attribute.array[ptnum] = oldValue + (newValue - oldValue) * lerp;
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}

export function _setPointAttributeColorForNamedFunction(namedFunction: BaseNamedFunction) {
	return function _setPointAttributeColor(
		object3D: Object3D,
		attribName: string,
		ptnum: number,
		newValue: Color,
		lerp: number
	): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!attribute) {
			return;
		}
		if (lerp >= 1) {
			newValue.toArray(attribute.array, ptnum * 3);
		} else {
			_c.fromBufferAttribute(attribute, ptnum);
			_c.lerp(newValue, lerp);
			_c.toArray(attribute.array, ptnum * 3);
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}
export function _setPointAttributeVector2ForNamedFunction(namedFunction: BaseNamedFunction) {
	return function _setPointAttributeVector2(
		object3D: Object3D,
		attribName: string,
		ptnum: number,
		newValue: Vector2,
		lerp: number
	): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!attribute) {
			return;
		}
		if (lerp >= 1) {
			newValue.toArray(attribute.array, ptnum * 2);
		} else {
			_v2.fromBufferAttribute(attribute, ptnum);
			_v2.lerp(newValue, lerp);
			_v2.toArray(attribute.array, ptnum * 2);
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}
export function _setPointAttributeVector3ForNamedFunction(namedFunction: BaseNamedFunction) {
	return function _setPointAttributeVector3(
		object3D: Object3D,
		attribName: string,
		ptnum: number,
		newValue: Vector3,
		lerp: number
	): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!attribute) {
			return;
		}
		if (lerp >= 1) {
			newValue.toArray(attribute.array, ptnum * 3);
		} else {
			_v3.fromBufferAttribute(attribute, ptnum);
			_v3.lerp(newValue, lerp);
			_v3.toArray(attribute.array, ptnum * 3);
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}
export function _setPointAttributeVector4ForNamedFunction(namedFunction: BaseNamedFunction) {
	return function _setPointAttributeVector4(
		object3D: Object3D,
		attribName: string,
		ptnum: number,
		newValue: Vector4,
		lerp: number
	): void {
		const geometry = (object3D as Object3DWithGeometry).geometry;
		if (!geometry) {
			return;
		}
		const attribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!attribute) {
			return;
		}
		if (lerp >= 1) {
			newValue.toArray(attribute.array, ptnum * 4);
		} else {
			_v4.fromBufferAttribute(attribute, ptnum);
			_v4.lerp(newValue, lerp);
			_v4.toArray(attribute.array, ptnum * 4);
		}
		markAttributeAsNeedsUpdateForFrame(attribute, namedFunction.timeController.frame());
	};
}

//
//
//
//
//
export class setPointPosition extends ObjectNamedFunction3<[number, Vector3, number]> {
	static override type() {
		return 'setPointPosition';
	}
	func = _setPointAttributeVector3Name(this, Attribute.POSITION);
}

export class setPointAttributeNumber extends ObjectNamedFunction4<[string, number, number, number]> {
	static override type() {
		return 'setPointAttributeNumber';
	}
	func = _setPointAttributeNumberForNamedFunction(this);
}
export class setPointAttributeColor extends ObjectNamedFunction4<[string, number, Color, number]> {
	static override type() {
		return 'setPointAttributeColor';
	}
	func = _setPointAttributeColorForNamedFunction(this);
}
export class setPointAttributeVector2 extends ObjectNamedFunction4<[string, number, Vector2, number]> {
	static override type() {
		return 'setPointAttributeVector2';
	}
	func = _setPointAttributeVector2ForNamedFunction(this);
}
export class setPointAttributeVector3 extends ObjectNamedFunction4<[string, number, Vector3, number]> {
	static override type() {
		return 'setPointAttributeVector3';
	}
	func = _setPointAttributeVector3ForNamedFunction(this);
}
export class setPointAttributeVector4 extends ObjectNamedFunction4<[string, number, Vector4, number]> {
	static override type() {
		return 'setPointAttributeVector4';
	}
	func = _setPointAttributeVector4ForNamedFunction(this);
}
