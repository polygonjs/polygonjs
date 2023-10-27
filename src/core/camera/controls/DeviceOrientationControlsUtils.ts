import {Euler, Quaternion, Vector3, Object3D} from 'three';
import {degToRad, radToDeg} from 'three/src/math/MathUtils';

export type ScreenOrientation = number;
export interface DeviceOrientationEventExtended extends DeviceOrientationEvent {
	requestPermission?: () => Promise<string>;
	webkitCompassHeading?: number;
}

export const CHANGE_EVENT = {type: 'change'};
export const EPS = 0.000001;
export const PI_DEG = radToDeg(Math.PI);
export const PI_DEG2 = 2 * radToDeg(Math.PI);

const AXIS_Z = new Vector3(0, 0, 1);
const euler = new Euler();
const q0 = new Quaternion();
const q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
const q2 = new Quaternion();
const ROTATION_ORDER_YXZ = 'YXZ';

function _setQuaternionFromAlphaBetaGamma(
	alpha: number,
	beta: number,
	gamma: number,
	orient: number,
	target: Quaternion
): void {
	euler.set(beta, alpha, -gamma, ROTATION_ORDER_YXZ); // 'ZXY' for the device, but 'YXZ' for us
	target.setFromEuler(euler); // orient the device
	target.multiply(q1); // camera looks out the back of the device, not the top
	target.multiply(q0.setFromAxisAngle(AXIS_Z, -orient)); // adjust for screen orientation
}
const alphaOffset = 0;
export function setQuaternionFromEvent(
	event: Partial<DeviceOrientationEvent>,
	screenOrientation: ScreenOrientation,
	target: Quaternion
): void {
	const alpha = event.alpha ? degToRad(event.alpha) + alphaOffset : 0; // Z
	const beta = event.beta ? degToRad(event.beta) : 0; // X'
	const gamma = event.gamma ? degToRad(event.gamma) : 0; // Y''
	const orient = screenOrientation ? degToRad(screenOrientation as number) : 0; // O

	_setQuaternionFromAlphaBetaGamma(alpha, beta, gamma, orient, target);
}
export function quaternionYAngle(relativeQuaternion: Quaternion) {
	euler.setFromQuaternion(relativeQuaternion);
	return -radToDeg(euler.y);
}
export function yAngleFromEvent(event: Partial<DeviceOrientationEvent>, screenOrientation: ScreenOrientation): number {
	setQuaternionFromEvent(event, screenOrientation, q2);
	return quaternionYAngle(q2);
}

interface RotationHierachy {
	ryOffset: Object3D;
	ry: Object3D;
	rx: Object3D;
	rz: Object3D;
}
function _createObjects(): RotationHierachy {
	const ryOffset = new Object3D();
	const ry = new Object3D();
	const rx = new Object3D();
	const rz = new Object3D();
	ryOffset.add(ry);
	ry.add(rx);
	rx.add(rz);
	return {
		ryOffset,
		ry,
		rx,
		rz,
	};
}
let _rotationHierarchy: RotationHierachy | undefined;
function _getRotationHierarchy() {
	return _rotationHierarchy || (_rotationHierarchy = _createObjects());
}

export function blendQuaternionToAbsoluteYAngle(
	relativeQuaternion: Quaternion,
	yAngleOffset: number,
	target: Quaternion
) {
	euler.setFromQuaternion(relativeQuaternion);

	const rotationHierarchy = _getRotationHierarchy();
	rotationHierarchy.ryOffset.rotation.set(0, -degToRad(yAngleOffset), 0);
	rotationHierarchy.ry.rotation.set(0, euler.y, 0);
	rotationHierarchy.rx.rotation.set(euler.x, 0, 0);
	rotationHierarchy.rz.rotation.set(0, 0, euler.z);

	rotationHierarchy.rz.updateWorldMatrix(true, true);
	target.setFromRotationMatrix(rotationHierarchy.rz.matrixWorld);
}

// export function ensureDeltaLessThan2PI(initValue: number, comparisonValue:number): number {
// 	const delta = initValue - comparisonValue;
// 	if (Math.abs(delta) > PI_DEG) {
// 		if (delta > 0) {
// 			return delta - PI_DEG2;
// 		} else {
// 			return delta + PI_DEG2;
// 		}
// 	}
// 	return delta;
// }
