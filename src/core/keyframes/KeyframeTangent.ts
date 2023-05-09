import {KeyframeTangent, KeyframeData} from './KeyframeCommon';
import {Vector2} from 'three';

export function createKeyframeTangent(): KeyframeTangent {
	return {slope: 0, accel: 0};
}
export function getTangent(keyframe: KeyframeData, isInTangent: boolean): KeyframeTangent {
	if (isInTangent) {
		return keyframe.in;
	} else {
		return keyframe.out || keyframe.in;
	}
}

export function keyframeTangentToEndPoint(keyframe: KeyframeData, isInTangent: boolean, target: Vector2) {
	const tangent = getTangent(keyframe, isInTangent);
	const angle = Math.asin(tangent.slope);
	target.x = Math.cos(angle) * tangent.accel;
	target.y = Math.sin(angle) * tangent.accel;
}
export function endPointToKeyframeTangent(endPoint: Vector2, isInTangent: boolean, target: KeyframeTangent) {
	const angle = endPoint.angle();
	target.slope = Math.sin(angle);
	target.accel = endPoint.length();
}

export function keyframeTangentSplit(keyframe: KeyframeData) {
	if (!keyframe.out) {
		keyframe.out = createKeyframeTangent();
	}
	copyKeyframeTangent(keyframe.in, keyframe.out);
}
export function keyframeTangentMerge(keyframe: KeyframeData) {
	const _in = keyframe.in;
	const _out = keyframe.out;
	if (!_out) {
		return;
	}
	keyframe.in.slope = (_in.slope + _out.slope) * 0.5;
	keyframe.in.accel = (_in.accel + _out.accel) * 0.5;
	delete keyframe.out;
}

export function copyKeyframeTangent(src: KeyframeTangent, target: KeyframeTangent) {
	target.slope = src.slope;
	target.accel = src.accel;
}
export function lerpKeyframeTangents(t1: KeyframeTangent, t2: KeyframeTangent, lerp: number, target: KeyframeTangent) {
	target.slope = t1.slope * (1 - lerp) + t2.slope * lerp;
	target.accel = t1.accel * (1 - lerp) + t2.accel * lerp;
}
