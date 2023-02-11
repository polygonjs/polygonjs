import {BufferGeometry, Vector2, Vector3, Vector4, Quaternion} from 'three';
import {InstanceAttrib} from '../../../../core/geometry/Instancer';

const tmpV2 = new Vector2();
const tmpV3 = new Vector3();
const tmpV4 = new Vector4();
const tmpQuat = new Quaternion();
const nextV2 = new Vector2();
const nextV3 = new Vector3();
const nextV4 = new Vector4();
const nextQuat = new Quaternion();
const STRIDE2 = 2;
const STRIDE3 = 3;
const STRIDE4 = 4;
export function updateInstancePositions(
	geometry: BufferGeometry,
	newValues: Vector3[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instancePositionAttribute = geometry.getAttribute(InstanceAttrib.POSITION);
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

export function updateInstanceQuaternions(
	geometry: BufferGeometry,
	newValues: Quaternion[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceQuaternionAttribute = geometry.getAttribute(InstanceAttrib.QUATERNION);
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

export function updateInstanceScales(
	geometry: BufferGeometry,
	scaleValues: Vector3[] | undefined,
	multValues: number[] | undefined,
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceScaleAttribute = geometry.getAttribute(InstanceAttrib.SCALE);
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

export function updateInstanceAttributeFloat(
	geometry: BufferGeometry,
	attribName: string,
	newValues: number[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceAttribute = geometry.getAttribute(attribName);
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
export function updateInstanceAttributeVector2(
	geometry: BufferGeometry,
	attribName: string,
	newValues: Vector2[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceAttribute = geometry.getAttribute(attribName);
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

export function updateInstanceAttributeVector3(
	geometry: BufferGeometry,
	attribName: string,
	newValues: Vector3[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceAttribute = geometry.getAttribute(attribName);
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

export function updateInstanceAttributeVector4(
	geometry: BufferGeometry,
	attribName: string,
	newValues: Vector4[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceAttribute = geometry.getAttribute(attribName);
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
export function updateInstanceAttributeQuaternions(
	geometry: BufferGeometry,
	attribName: string,
	newValues: Quaternion[],
	lerp: number,
	attributeNeedsUpdate: boolean
) {
	const instanceAttribute = geometry.getAttribute(attribName);
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
