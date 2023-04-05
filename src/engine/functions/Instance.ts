import {BufferGeometry, BufferAttribute, Object3D, Mesh, Vector2, Vector3, Vector4, Quaternion, Color} from 'three';
import {InstanceAttrib} from '../../core/geometry/Instancer';
import {ObjectNamedFunction3, ObjectNamedFunction4, ObjectNamedFunction6} from './_Base';
const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();
const tmpQuat = new Quaternion();
const tmpColor = new Color();
const nextV2 = new Vector2();
const nextV3 = new Vector3();
const nextV4 = new Vector4();
const nextColor = new Color();
const nextQuat = new Quaternion();
const STRIDE2 = 2;
const STRIDE3 = 3;
const STRIDE4 = 4;

//
//
//
//
//
function _setGeometryInstancePositions(
	geometry: BufferGeometry,
	newValues: Vector3[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instancePositionAttribute = geometry.getAttribute(InstanceAttrib.POSITION) as BufferAttribute | undefined;
	if (!instancePositionAttribute) {
		return;
	}
	const doLerp = lerp < 1;
	const instancePositionArray = instancePositionAttribute.array as number[];
	let i = 0;

	for (let value of newValues) {
		if (doLerp) {
			nextV3.copy(value);
			tmpV3.fromArray(instancePositionArray, i * STRIDE3);
			tmpV3.lerp(nextV3, lerp);
		} else {
			tmpV3.copy(value);
		}

		tmpV3.toArray(instancePositionArray, i * STRIDE3);
		i++;
	}

	if (attributeNeedsUpdate) {
		instancePositionAttribute.needsUpdate = true;
	}
}

function _setGeometryInstanceQuaternions(
	geometry: BufferGeometry,
	newValues: Quaternion[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceQuaternionAttribute = geometry.getAttribute(InstanceAttrib.QUATERNION) as BufferAttribute | undefined;
	if (!instanceQuaternionAttribute) {
		return;
	}
	const doLerp = lerp < 1;
	const instanceQuaternionArray = instanceQuaternionAttribute.array as number[];
	let i = 0;
	for (let value of newValues) {
		if (doLerp) {
			nextQuat.copy(value);
			tmpQuat.fromArray(instanceQuaternionArray, i * STRIDE4);
			tmpQuat.slerp(nextQuat, lerp);
		} else {
			tmpQuat.copy(value);
		}

		tmpQuat.toArray(instanceQuaternionArray, i * STRIDE4);
		i++;
	}

	if (attributeNeedsUpdate) {
		instanceQuaternionAttribute.needsUpdate = true;
	}
}
function _setGeometryInstanceScales(
	geometry: BufferGeometry,
	scaleValues: Vector3[],
	multValues: number[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceScaleAttribute = geometry.getAttribute(InstanceAttrib.SCALE) as BufferAttribute | undefined;
	if (!instanceScaleAttribute) {
		return;
	}
	const doLerp = lerp < 1;
	const instanceScaleArray = instanceScaleAttribute.array as number[];
	let i = 0;

	if (scaleValues && multValues) {
		const minCount = Math.min(scaleValues.length, multValues.length);
		for (let i = 0; i < minCount; i++) {
			const scaleValue = scaleValues[i];
			const multValue = multValues[i];
			if (doLerp) {
				nextV3.copy(scaleValue).multiplyScalar(multValue);
				tmpV3.fromArray(instanceScaleArray, i * STRIDE3);
				tmpV3.lerp(nextV3, lerp);
			} else {
				tmpV3.copy(scaleValue).multiplyScalar(multValue);
			}

			tmpV3.toArray(instanceScaleArray, i * STRIDE3);
		}
	} else {
		if (scaleValues) {
			for (let value of scaleValues) {
				if (doLerp) {
					nextV3.copy(value);
					tmpV3.fromArray(instanceScaleArray, i * STRIDE3);
					tmpV3.lerp(nextV3, lerp);
				} else {
					tmpV3.copy(value);
				}

				tmpV3.toArray(instanceScaleArray, i * STRIDE3);
				i++;
			}
		} else if (multValues) {
			for (let value of multValues) {
				if (doLerp) {
					nextV3.set(value, value, value);
					tmpV3.fromArray(instanceScaleArray, i * STRIDE3);
					tmpV3.lerp(nextV3, lerp);
				} else {
					tmpV3.set(value, value, value);
				}

				tmpV3.toArray(instanceScaleArray, i * STRIDE3);
				i++;
			}
		}
	}

	if (attributeNeedsUpdate) {
		instanceScaleAttribute.needsUpdate = true;
	}
}

//
//
//
//
//
export class setGeometryInstancePositions extends ObjectNamedFunction3<[Array<Vector3>, number, boolean]> {
	static override type() {
		return 'setGeometryInstancePositions';
	}
	func(object3D: Object3D, newValues: Vector3[], lerp: number, attributeNeedsUpdate: boolean): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		_setGeometryInstancePositions(geometry, newValues, lerp, attributeNeedsUpdate);
	}
}

export class setGeometryInstanceQuaternions extends ObjectNamedFunction3<[Array<Quaternion>, number, boolean]> {
	static override type() {
		return 'setGeometryInstanceQuaternions';
	}
	func(object3D: Object3D, newValues: Quaternion[], lerp: number, attributeNeedsUpdate: boolean): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		_setGeometryInstanceQuaternions(geometry, newValues, lerp, attributeNeedsUpdate);
	}
}

export class setGeometryInstanceScales extends ObjectNamedFunction4<[Array<Vector3>, number[], number, boolean]> {
	static override type() {
		return 'setGeometryInstanceScales';
	}
	func(
		object3D: Object3D,
		scaleValues: Vector3[],
		multValues: number[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		_setGeometryInstanceScales(geometry, scaleValues, multValues, lerp, attributeNeedsUpdate);
	}
}
export class setGeometryInstanceTransforms extends ObjectNamedFunction6<
	[Array<Vector3>, Array<Quaternion>, Array<Vector3>, number[], number, boolean]
> {
	static override type() {
		return 'setGeometryInstanceTransforms';
	}
	func(
		object3D: Object3D,
		positions: Vector3[],
		quaternions: Quaternion[],
		scaleValues: Vector3[],
		multValues: number[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		_setGeometryInstancePositions(geometry, positions, lerp, attributeNeedsUpdate);
		_setGeometryInstanceQuaternions(geometry, quaternions, lerp, attributeNeedsUpdate);
		_setGeometryInstanceScales(geometry, scaleValues, multValues, lerp, attributeNeedsUpdate);
	}
}

//
//
// Instance Attributes
//
//

export class setGeometryInstanceAttributeFloat extends ObjectNamedFunction4<[string, Array<number>, number, boolean]> {
	static override type() {
		return 'setGeometryInstanceAttributeFloat';
	}
	func(
		object3D: Object3D,
		attribName: string,
		newValues: number[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const instanceAttribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!instanceAttribute) {
			return;
		}
		const doLerp = lerp < 1;
		const instanceAttributeArray = instanceAttribute.array as number[];
		let i = 0;

		for (let value of newValues) {
			if (doLerp) {
				const currentValue = instanceAttributeArray[i];
				instanceAttributeArray[i] = lerp * value + (1 - lerp) * currentValue;
			} else {
				instanceAttributeArray[i] = value;
			}
			i++;
		}

		if (attributeNeedsUpdate) {
			instanceAttribute.needsUpdate = true;
		}
	}
}

export class setGeometryInstanceAttributeColor extends ObjectNamedFunction4<[string, Array<Color>, number, boolean]> {
	static override type() {
		return 'setGeometryInstanceAttributeColor';
	}
	func(
		object3D: Object3D,
		attribName: string,
		newValues: Color[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const instanceAttribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!instanceAttribute) {
			return;
		}
		const doLerp = lerp < 1;
		const instanceAttributeArray = instanceAttribute.array as number[];
		let i = 0;

		for (let value of newValues) {
			if (doLerp) {
				nextColor.copy(value);
				tmpColor.fromArray(instanceAttributeArray, i * STRIDE3);
				tmpColor.lerp(nextColor, lerp);
			} else {
				tmpColor.copy(value);
			}

			tmpColor.toArray(instanceAttributeArray, i * STRIDE3);
			i++;
		}

		if (attributeNeedsUpdate) {
			instanceAttribute.needsUpdate = true;
		}
	}
}
export class setGeometryInstanceAttributeQuaternion extends ObjectNamedFunction4<
	[string, Array<Quaternion>, number, boolean]
> {
	static override type() {
		return 'setGeometryInstanceAttributeQuaternion';
	}
	func(
		object3D: Object3D,
		attribName: string,
		newValues: Quaternion[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const instanceAttribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!instanceAttribute) {
			return;
		}
		const doLerp = lerp < 1;
		const instanceAttributeArray = instanceAttribute.array as number[];
		let i = 0;
		for (let value of newValues) {
			if (doLerp) {
				nextQuat.copy(value);
				tmpQuat.fromArray(instanceAttributeArray, i * STRIDE4);
				tmpQuat.slerp(nextQuat, lerp);
			} else {
				tmpQuat.copy(value);
			}

			tmpQuat.toArray(instanceAttributeArray, i * STRIDE4);
			i++;
		}

		if (attributeNeedsUpdate) {
			instanceAttribute.needsUpdate = true;
		}
	}
}

export class setGeometryInstanceAttributeVector2 extends ObjectNamedFunction4<
	[string, Array<Vector2>, number, boolean]
> {
	static override type() {
		return 'setGeometryInstanceAttributeVector2';
	}
	func(
		object3D: Object3D,
		attribName: string,
		newValues: Vector2[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const instanceAttribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!instanceAttribute) {
			return;
		}
		const doLerp = lerp < 1;
		const instanceAttributeArray = instanceAttribute.array as number[];
		let i = 0;

		for (let value of newValues) {
			if (doLerp) {
				nextV2.copy(value);
				tmpV2.fromArray(instanceAttributeArray, i * STRIDE2);
				tmpV2.lerp(nextV2, lerp);
			} else {
				tmpV2.copy(value);
			}

			tmpV2.toArray(instanceAttributeArray, i * STRIDE2);
			i++;
		}

		if (attributeNeedsUpdate) {
			instanceAttribute.needsUpdate = true;
		}
	}
}

export class setGeometryInstanceAttributeVector3 extends ObjectNamedFunction4<
	[string, Array<Vector3>, number, boolean]
> {
	static override type() {
		return 'setGeometryInstanceAttributeVector3';
	}
	func(
		object3D: Object3D,
		attribName: string,
		newValues: Vector3[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const instanceAttribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!instanceAttribute) {
			return;
		}
		const doLerp = lerp < 1;
		const instanceAttributeArray = instanceAttribute.array as number[];
		let i = 0;

		for (let value of newValues) {
			if (doLerp) {
				nextV3.copy(value);
				tmpV3.fromArray(instanceAttributeArray, i * STRIDE3);
				tmpV3.lerp(nextV3, lerp);
			} else {
				tmpV3.copy(value);
			}

			tmpV3.toArray(instanceAttributeArray, i * STRIDE3);
			i++;
		}

		if (attributeNeedsUpdate) {
			instanceAttribute.needsUpdate = true;
		}
	}
}

export class setGeometryInstanceAttributeVector4 extends ObjectNamedFunction4<
	[string, Array<Vector4>, number, boolean]
> {
	static override type() {
		return 'setGeometryInstanceAttributeVector4';
	}
	func(
		object3D: Object3D,
		attribName: string,
		newValues: Vector4[],
		lerp: number,
		attributeNeedsUpdate: boolean
	): void {
		const geometry = (object3D as Mesh).geometry;
		if (!geometry) {
			return;
		}
		const instanceAttribute = geometry.getAttribute(attribName) as BufferAttribute | undefined;
		if (!instanceAttribute) {
			return;
		}
		const doLerp = lerp < 1;
		const instanceAttributeArray = instanceAttribute.array as number[];
		let i = 0;

		for (let value of newValues) {
			if (doLerp) {
				nextV4.copy(value);
				tmpV4.fromArray(instanceAttributeArray, i * STRIDE4);
				tmpV4.lerp(nextV4, lerp);
			} else {
				tmpV4.copy(value);
			}

			tmpV3.toArray(instanceAttributeArray, i * STRIDE4);
			i++;
		}

		if (attributeNeedsUpdate) {
			instanceAttribute.needsUpdate = true;
		}
	}
}
