import {CubicBezierCurve, Vector2} from 'three';
import {KeyframeData, getTangent, SearchRange} from '../KeyframeCommon';

export function setCubicBezierCurveFromKeyframePair(
	keyframeStart: KeyframeData,
	keyframeEnd: KeyframeData,
	target: CubicBezierCurve
) {
	const tangentStart = getTangent(keyframeStart, false);
	const tangentEnd = getTangent(keyframeEnd, true);
	target.v0.x = keyframeStart.pos;
	target.v0.y = keyframeStart.value;
	target.v1.x = keyframeStart.pos + tangentStart.x;
	target.v1.y = keyframeStart.value + tangentStart.y;
	// keyframe 2
	target.v3.x = keyframeEnd.pos;
	target.v3.y = keyframeEnd.value;
	target.v2.x = keyframeEnd.pos - tangentEnd.x;
	target.v2.y = keyframeEnd.value - tangentEnd.y;

	// console.log(target.v0.toArray(), target.v1.toArray(), target.v2.toArray(), target.v3.toArray());
}
// export function remapTo01(keyframeStart: KeyframeData, keyframeEnd: KeyframeData, target: CubicBezierCurve) {
// 	const posStart = keyframeStart.pos;
// 	const posEnd = keyframeEnd.pos;
// 	function _remapN(x: number) {
// 		return (x - posStart) / (posEnd - posStart);
// 	}
// 	function _remapV2(v: Vector2) {
// 		v.x = _remapN(v.x);
// 	}
// 	_remapV2(target.v0);
// 	_remapV2(target.v1);
// 	_remapV2(target.v2);
// 	_remapV2(target.v3);
// }

const _v2 = new Vector2();
function getX(t: number, curve: CubicBezierCurve) {
	curve.getPoint(t, _v2);
	return _v2.x;
}

// function getXDerivative(t: number, curve: CubicBezierCurve) {
// 	curve.getTangent(t, _v2);
// 	console.log('getXDerivative', t, _v2.toArray());
// 	return _v2.x;
// }

const MAX_ITERATIONS = 500;
const EPSILON = 1e-6;
const range: SearchRange = {min: 0, max: 1};
export function findTForX(expectedX: number, curve: CubicBezierCurve): number {
	const curveStartPos = curve.v0.x;
	const curveEndPos = curve.v3.x;
	range.min = curveStartPos;
	range.max = curveEndPos;

	function _normalizePos(_pos: number) {
		return (_pos - curveStartPos) / (curveEndPos - curveStartPos);
	}

	let currentX = expectedX;

	for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
		const foundX = getX(_normalizePos(currentX), curve);
		const delta = foundX - expectedX;
		if (Math.abs(delta) < EPSILON) {
			return _normalizePos(currentX);
		}
		if (foundX < expectedX) {
			range.min = currentX;
			currentX = (range.max + currentX) / 2;
		} else {
			range.max = currentX;
			currentX = (range.min + currentX) / 2;
		}
	}
	return _normalizePos(currentX);
}

// export function findTForX(
// 	t: number,
// 	curve: CubicBezierCurve,
// 	range: SearchRange,
// 	iteration: number = 0,
// 	epsilon = 1e-6
// ): number {
// 	if (iteration >= MAX_ITERATION) {
// 		console.warn('max iteration reached');
// 		return t;
// 	}

// 	const t2 = getX(t, curve);

// 	const delta = t2 - t;
// 	if (Math.abs(delta) < epsilon) {
// 		console.log('reached');
// 		return t2;
// 	}
// 	if (t > 0 && t < 2 / 100) {
// 		console.log({iteration, t, t2, delta});
// 	}
// 	if (t2 - t) {
// 		t = (range.min + t) / 2;
// 		range.max = t;
// 	} else {
// 		t = (range.max + t) / 2;
// 		range.min = t;
// 	}

// 	return findTForX(t, curve, range, iteration + 1, epsilon);
// }

// export function findTForX(x: number, curve: CubicBezierCurve, iterations = 10, epsilon = 1e-6) {
// 	let t = x; // Initial guess
// 	console.log('---', x);

// 	for (let i = 0; i < iterations; i++) {
// 		const xT = getX(t, curve) - x;
// 		if (Math.abs(xT) < epsilon) {
// 			return t;
// 		}

// 		const xDerivative = getXDerivative(t, curve);
// 		if (Math.abs(xDerivative) < epsilon) {
// 			break;
// 		}

// 		t = t - xT / xDerivative;
// 		console.log({i, x, xT, xDerivative, t});
// 	}

// 	return t;
// }

// export function cubicBezierCurveFromKeyframes(unsortedKeyframes: KeyframeData[]): CubicBezierCurve[] {
// 	const list: CubicBezierCurve[] = [];
// 	if (unsortedKeyframes.length < 2) {
// 		return list;
// 	}
// 	const keyframes = unsortedKeyframes.sort((k1, k2) => k1.pos - k2.pos);

// 	for (let i = 0; i < keyframes.length - 1; i++) {
// 		const currentKeyframe = keyframes[i];
// 		const nextKeyframe = keyframes[i + 1];
// 		const curve = new CubicBezierCurve(new Vector2(), new Vector2(), new Vector2(), new Vector2());
// 		setCubicBezierCurveFromKeyframePair(currentKeyframe, nextKeyframe, curve);
// 		list.push(curve);
// 	}
// 	return list;
// }

// export function getPointFromCurves(t: number, curves: CubicBezierCurve[], target: Vector2) {
// 	let selectedCurve: CubicBezierCurve | undefined;
// 	for (let curve of curves) {
// 		if (t <= curve.v3.x) {
// 			selectedCurve = curve;
// 			break;
// 		}
// 	}
// 	if (selectedCurve == null) {
// 		return 0;
// 	}
// 	const minT = selectedCurve.v0.x;
// 	const maxT = selectedCurve.v3.x;
// 	const remappedT = (t - minT) / (maxT - minT);
// 	selectedCurve.getPoint(remappedT, target);
// }

// const _v2 = new Vector2();
// export class CubicBezierCurveChannel {
// 	private _curves: CubicBezierCurve[];
// 	constructor(channelData: ChannelData) {
// 		this._curves = cubicBezierCurveFromKeyframes(channelData.keyframes);
// 	}
// 	value(t: number): number {
// 		getPointFromCurves(t, this._curves, _v2);
// 		return _v2.y;
// 	}
// }
