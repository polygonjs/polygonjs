import {
	Euler,
	Quaternion,
	// Vector2,
	Vector3,
	// Matrix4,
	Object3D,
} from 'three';
import {degToRad, radToDeg} from 'three/src/math/MathUtils';
// import {debug} from './DeviceOrientationControlsDebug';

export type ScreenOrientation = number;
export interface DeviceOrientationEventExtended extends DeviceOrientationEvent {
	requestPermission?: () => Promise<string>;
	webkitCompassHeading?: number;
}

export const CHANGE_EVENT = {type: 'change'};
export const EPS = 0.000001;
export const PI_DEG = radToDeg(Math.PI);
export const PI_DEG2 = 2 * radToDeg(Math.PI);

// const AXIS_X = new Vector3(1, 0, 0);
// const AXIS_Y = new Vector3(0, 1, 0);
const AXIS_Z = new Vector3(0, 0, 1);
const euler = new Euler();
const q0 = new Quaternion();
const q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis
const q2 = new Quaternion();
// const qRotationY = new Quaternion();
// const qRotationHorizontalAngle = new Quaternion();
// const qRotationVerticalAngle = new Quaternion();
// const qRotationYFull = new Quaternion();
// const _matrix = new Matrix4();
// const _localPos = new Vector3();
// const _localPos2D = new Vector2();
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
	// alphaOffset: number,
	screenOrientation: ScreenOrientation,
	target: Quaternion
): void {
	// if (!event) {
	// 	return;
	// }
	// if (event) {
	const alpha = event.alpha ? degToRad(event.alpha) + alphaOffset : 0; // Z
	const beta = event.beta ? degToRad(event.beta) : 0; // X'
	const gamma = event.gamma ? degToRad(event.gamma) : 0; // Y''
	const orient = screenOrientation ? degToRad(screenOrientation as number) : 0; // O
	// const orient = degToRad(screenOrientation as number); // O

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

// function _compassHeading(absoluteEvent: Partial<DeviceOrientationEventExtended>) {
// 	const compassHeading =
// 		absoluteEvent.webkitCompassHeading != null
// 			? absoluteEvent.webkitCompassHeading
// 			: absoluteEvent.alpha
// 			? absoluteEvent.alpha //Math.abs(absoluteEvent.alpha - 360)
// 			: 0;
// 	// console.log({
// 	// 	webkitCompassHeading: absoluteEvent.webkitCompassHeading,
// 	// 	alpha: absoluteEvent.alpha,
// 	// 	// alphaAbs: absoluteEvent.alpha ? Math.abs(absoluteEvent.alpha - 360) : 0,
// 	// });
// 	return compassHeading;
// }
// export function setQuaternionFromEventAbsolute(
// 	// relativeEvent: Partial<DeviceOrientationEventExtended>,
// 	absoluteEvent: Partial<DeviceOrientationEventExtended>,
// 	alphaOffset: number,
// 	screenOrientation: ScreenOrientation,
// 	target: Quaternion
// ): void {
// 	const compassHeading = _compassHeading(absoluteEvent);
// 	const alpha = degToRad(compassHeading) + alphaOffset; // Z
// 	const beta = 0; //relativeEvent.beta ? degToRad(relativeEvent.beta) : 0; // X'
// 	const gamma = 0; //relativeEvent.gamma ? degToRad(relativeEvent.gamma) : 0; // Y''

// 	const orient = screenOrientation ? degToRad(screenOrientation as number) : 0; // O
// 	_setQuaternionFromAlphaBetaGamma(alpha, beta, gamma, orient, target);
// }
// function _yRotationAngleFromQuaterion(quaternion: Quaternion): number {
// 	_matrix.makeRotationFromQuaternion(quaternion); //.premultiply(_qOffset);

// 	_localPos.set(1, 0, 0).applyMatrix4(_matrix);
// 	_localPos.y = 0;
// 	_localPos.normalize();
// 	_localPos2D.set(_localPos.x, _localPos.z);
// 	return _localPos2D.angle(); //getYAngle(_localPos.x, _localPos.z);
// }
// function _matrixYAngle(matrix: Matrix4) {
// 	_localPos.set(1, 0, 0).applyMatrix4(matrix);
// 	_localPos.y = 0;
// 	_localPos.normalize();
// 	_localPos2D.set(_localPos.x, _localPos.z);
// 	return _localPos2D.angle(); //getYAngle(_localPos.x, _localPos.z);
// }
// function _matrixVerticalAngle(matrix: Matrix4) {
// 	_localPos.set(0, 0, 1).applyMatrix4(matrix);
// 	const isNegative = _localPos.y < 0;
// 	_localPos.y = 0;
// 	// _localPos2.copy(_localPos).normalize();
// 	const dot = _localPos.length(); //_localPos.dot(_localPos2);
// 	return Math.acos(dot) * (isNegative ? -1 : 1);
// }
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
	// lerpFactor: number,
	target: Quaternion
) {
	// rotationHierarchy.tmp.quaternion.copy(relativeQuaternion);
	// rotationHierarchy.tmp.updateMatrix()
	euler.setFromQuaternion(relativeQuaternion);

	const rotationHierarchy = _getRotationHierarchy();
	rotationHierarchy.ryOffset.rotation.set(0, -degToRad(yAngleOffset), 0);
	rotationHierarchy.ry.rotation.set(0, euler.y, 0);
	rotationHierarchy.rx.rotation.set(euler.x, 0, 0);
	rotationHierarchy.rz.rotation.set(0, 0, euler.z);

	// _matrix.makeRotationFromQuaternion(relativeQuaternion);
	// const currentYAngle2 = radToDeg(_matrixYAngle(_matrix)); //getYAngle(_localPos.x, _localPos.z);
	// const currentYAngle = -radToDeg(euler.y);
	// const lerpedAngle = (1 - lerpFactor) * currentYAngle + lerpFactor * yAngle;
	// rotationHierarchy.ry.rotation.set(0, -degToRad(lerpedAngle), 0);

	rotationHierarchy.rz.updateWorldMatrix(true, true);
	target.setFromRotationMatrix(rotationHierarchy.rz.matrixWorld);
	// target.copy(relativeQuaternion);

	// _matrix.makeRotationFromQuaternion(relativeQuaternion);
	// // const verticalAngle = _matrixVerticalAngle(_matrix);
	// // const targetYAngle = yAngle-currentYAngle;
	// // debug({currentYAngle, targetYAngle});
	// // debug({verticalAngle});

	// qRotationHorizontalAngle.setFromAxisAngle(AXIS_Y, -degToRad(currentYAngle)); // this works
	// // qRotationVerticalAngle.setFromAxisAngle(AXIS_X, -verticalAngle);
	// qRotationVerticalAngle.copy(relativeQuaternion).multiply(qRotationHorizontalAngle);

	// // compensate Y rotation for compass
	// // const targetY = this._targetYOffset();
	// // const lerpFactor = this._lerpFactor();
	// // this._yOffset = lerp(this._yOffset, targetY, lerpFactor);
	// // if (this._yOffsetHasReachedTargetYOnce == false && Math.abs(this._yOffset - targetY) < 5) {
	// // 	this._yOffsetHasReachedTargetYOnce = true;
	// // }
	// const lerpedAngle = (1 - lerpFactor) * currentYAngle + lerpFactor * yAngle;
	// debug({currentYAngle, yAngle, lerpedAngle});
	// qRotationY.setFromAxisAngle(AXIS_Y, degToRad(lerpedAngle));
	// // qRotationYFull.copy(quaternion).multiply(qRotationY)
	// // qRotationYLerped.identity().slerp(qRotationY, 1 - lerpFactor);
	// // target.copy(qRotationVerticalAngle).multiply(qRotationY);
	// target.copy(qRotationVerticalAngle); //.multiply(qRotationHorizontalAngle);
	// target.copy(qRotationHorizontalAngle); //.multiply(qRotationVerticalAngle);
}

// export function blendRelativeToAbsoluteQuaternionOnYAxisOnly(
// 	relativeQ: Quaternion,
// 	absoluteQ: Quaternion,
// 	blendFactor: number,
// 	target: Quaternion
// ) {
// 	const relativeAngle = _yRotationAngleFromQuaterion(relativeQ);
// 	const absoluteAngle = _yRotationAngleFromQuaterion(absoluteQ);
// 	const deltaBasic = absoluteAngle - relativeAngle;
// 	const delta = Math.abs(deltaBasic) > Math.PI ? deltaBasic - Math.sign(deltaBasic) * 2 * Math.PI : deltaBasic;
// 	// console.log({relativeAngle, absoluteAngle, deltaBasic, delta});
// 	relativeQY.setFromAxisAngle(AXIS_Y, delta);
// 	relativeQY2.identity().slerp(relativeQY, blendFactor);
// 	// absoluteQY.setFromAxisAngle(AXIS_Y, absoluteAngle);
// 	// const angle = relativeQY.angleTo(absoluteQY);
// 	// relativeQY.setFromAxisAngle(AXIS_Y, angle);
// 	target.copy(relativeQY2).multiply(relativeQ);
// 	// target.copy(relativeQ).multiply(relativeQY2);
// }

export function screenOrientation() {
	const windowOrientation = window.orientation;
	if (windowOrientation != null) {
		return windowOrientation;
	}
	// this._screenOrientation = -window.screen.orientation.angle || 0;
	const screenAngle: number | undefined = window?.screen?.orientation?.angle || 0;
	// const orientation = this._screenOrientation != null ? this._screenOrientation : screenAngle ? screenAngle : 0;
	// debugOrientation(orientation);
	return screenAngle;
}
