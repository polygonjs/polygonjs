import {CubicBezierCurve, Vector2} from 'three';
import {KeyframeData, SearchRange, SetCurveCallback} from '../KeyframeCommon';
import {keyframeTangentToEndPoint} from '../KeyframeTangent';

const _v2 = new Vector2();
const _endPt0 = new Vector2();
const _endPt1 = new Vector2();
export const curve = new CubicBezierCurve(new Vector2(), new Vector2(), new Vector2(), new Vector2());

export const setCurveFromKeyframePairCubic: SetCurveCallback = (
	keyframeStart: KeyframeData,
	keyframeEnd: KeyframeData
) => {
	keyframeTangentToEndPoint(keyframeStart, false, _endPt0);
	keyframeTangentToEndPoint(keyframeEnd, true, _endPt1);
	// keyframe 1
	curve.v0.x = keyframeStart.pos;
	curve.v0.y = keyframeStart.value;
	curve.v1.x = keyframeStart.pos + _endPt0.x;
	curve.v1.y = keyframeStart.value + _endPt0.y;
	// keyframe 2
	curve.v3.x = keyframeEnd.pos;
	curve.v3.y = keyframeEnd.value;
	curve.v2.x = keyframeEnd.pos - _endPt1.x;
	curve.v2.y = keyframeEnd.value - _endPt1.y;
};

function getX(t: number, curve: CubicBezierCurve) {
	curve.getPoint(t, _v2);
	return _v2.x;
}

const MAX_ITERATIONS = 500;
const EPSILON = 1e-6;
const range: SearchRange = {min: 0, max: 1};
function findTForXCubic(expectedX: number) {
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

export function getValueCubic(pos: number): number {
	const t = findTForXCubic(pos);
	curve.getPoint(t, _v2);
	return _v2.y;
}
