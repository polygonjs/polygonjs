import {CubicBezierCurve, Vector2} from 'three';
import {KeyframeData, ChannelData} from './KeyframeCommon';

export function setCubicBezierCurveFromKeyframePair(
	keyframeStart: KeyframeData,
	keyframeEnd: KeyframeData,
	target: CubicBezierCurve
) {
	target.v0.x = keyframeStart.pos;
	target.v0.y = keyframeStart.value;
	target.v1.x = keyframeStart.pos + keyframeStart.tan.x;
	target.v1.y = keyframeStart.value + keyframeStart.tan.y;
	// keyframe 2
	target.v3.x = keyframeEnd.pos;
	target.v3.y = keyframeEnd.value;
	target.v2.x = keyframeEnd.pos - keyframeEnd.tan.x;
	target.v2.y = keyframeEnd.value - keyframeEnd.tan.y;
}

export function cubicBezierCurveFromKeyframes(unsortedKeyframes: KeyframeData[]): CubicBezierCurve[] {
	const list: CubicBezierCurve[] = [];
	if (unsortedKeyframes.length < 2) {
		return list;
	}
	const keyframes = unsortedKeyframes.sort((k1, k2) => k1.pos - k2.pos);

	for (let i = 0; i < keyframes.length - 1; i++) {
		const currentKeyframe = keyframes[i];
		const nextKeyframe = keyframes[i + 1];
		const curve = new CubicBezierCurve(new Vector2(), new Vector2(), new Vector2(), new Vector2());
		setCubicBezierCurveFromKeyframePair(currentKeyframe, nextKeyframe, curve);
		list.push(curve);
	}
	return list;
}

export function getPointFromCurves(t: number, curves: CubicBezierCurve[], target: Vector2) {
	let selectedCurve: CubicBezierCurve | undefined;
	for (let curve of curves) {
		if (t <= curve.v3.x) {
			selectedCurve = curve;
			break;
		}
	}
	if (selectedCurve == null) {
		return 0;
	}
	const minT = selectedCurve.v0.x;
	const maxT = selectedCurve.v3.x;
	const remappedT = (t - minT) / (maxT - minT);
	selectedCurve.getPoint(remappedT, target);
}

const _v2 = new Vector2();
export class CubicBezierCurveChannel {
	private _curves: CubicBezierCurve[];
	constructor(unsortedKeyframes: ChannelData) {
		this._curves = cubicBezierCurveFromKeyframes(unsortedKeyframes);
	}
	value(t: number): number {
		getPointFromCurves(t, this._curves, _v2);
		return _v2.y;
	}
}
