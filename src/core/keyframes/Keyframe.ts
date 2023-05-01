// import {CubicBezierCurve, Vector2} from 'three';
// import {KeyframeData} from './KeyframeCommon';

// const tmp = new Vector2();
// // const tmp2 = new Vector2();
// export function cubicBezierCurveFromKeyframes(unsortedKeyframes: KeyframeData[]): CubicBezierCurve[] {
// 	const list: CubicBezierCurve[] = [];
// 	if (unsortedKeyframes.length < 2) {
// 		return list;
// 	}
// 	const keyframes = unsortedKeyframes.sort((k1, k2) => k1.pos - k2.pos);

// 	for (let i = 0; i < keyframes.length - 1; i++) {
// 		const currentKeyframe = keyframes[i];
// 		const nextKeyframe = keyframes[i + 1];
// 		// p0
// 		const p0 = new Vector2(currentKeyframe.pos, currentKeyframe.value);
// 		// p1
// 		tmp.set(currentKeyframe.tan.x, currentKeyframe.tan.y);
// 		const p1 = new Vector2(currentKeyframe.pos, currentKeyframe.value).add(tmp);
// 		// p2
// 		tmp.set(nextKeyframe.tan.x, nextKeyframe.tan.y);
// 		const p2 = new Vector2(nextKeyframe.pos, nextKeyframe.value).sub(tmp);
// 		// p3
// 		const p3 = new Vector2(nextKeyframe.pos, nextKeyframe.value);
// 		// curve
// 		const curve = new CubicBezierCurve(p0, p1, p2, p3);
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
