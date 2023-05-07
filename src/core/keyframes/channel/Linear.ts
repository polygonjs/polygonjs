import {LineCurve, Vector2} from 'three';
import {KeyframeData, SetCurveCallback} from '../KeyframeCommon';

export const curve = new LineCurve(new Vector2(), new Vector2());

export const setCurveFromKeyframePairLinear: SetCurveCallback = (
	keyframeStart: KeyframeData,
	keyframeEnd: KeyframeData
) => {
	// keyframe 1
	curve.v1.x = keyframeStart.pos;
	curve.v1.y = keyframeStart.value;
	// keyframe 2
	curve.v2.x = keyframeEnd.pos;
	curve.v2.y = keyframeEnd.value;
};

export function getValueLinear(pos: number): number {
	const curveStartPos = curve.v1.x;
	const curveEndPos = curve.v2.x;

	const t = (pos - curveStartPos) / (curveEndPos - curveStartPos);
	const value = t * curve.v2.y + (1 - t) * curve.v1.y;
	return value;
}
