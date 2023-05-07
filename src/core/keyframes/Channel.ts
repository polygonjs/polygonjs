import {Box2, CubicBezierCurve, Vector2} from 'three';
import {ChannelData, KeyframeData} from './KeyframeCommon';
import {findTForX, setCubicBezierCurveFromKeyframePair} from './channel/CubicBezierCurveChannel';
import {mix} from '../math/_Module';

interface KeyframePair {
	start: KeyframeData;
	end: KeyframeData;
}
const _v2 = new Vector2();
const curve = new CubicBezierCurve(new Vector2(), new Vector2(), new Vector2(), new Vector2());

export class Channel {
	private _valuesByPos: Map<number, number> = new Map();
	constructor(public readonly data: ChannelData) {
		Channel.validate(this.data);
		this.compute();
	}
	static fromJSON(data: ChannelData) {
		return new Channel(data);
	}
	value(t: number): number {
		if (t == Math.floor(t)) {
			const value = this._valuesByPos.get(t);
			if (value != null) {
				return value;
			}
			const keyframes = this.data.keyframes;
			if (keyframes.length == 0) {
				return 0;
			}
			const firstPos = keyframes[0].pos;
			const lastPos = keyframes[keyframes.length - 1].pos;
			if (t < firstPos) {
				return this._valuesByPos.get(firstPos) || 0;
			}
			if (t > lastPos) {
				return this._valuesByPos.get(lastPos) || 0;
			}
		}
		const t0 = Math.floor(t);
		const t1 = Math.ceil(t);
		const v0 = this._valuesByPos.get(t0) || 0;
		const v1 = this._valuesByPos.get(t1) || 0;
		return mix(v0, v1, t - t0);
	}
	static validate(data: ChannelData) {
		const sortedKeyframes = data.keyframes.sort((k1, k2) => k1.pos - k2.pos);
		const sortedPos = sortedKeyframes.map((k) => k.pos);
		const sortedValues = sortedKeyframes.map((k) => k.value);

		// sort by replacing the values, not just swapping the keyframe data objects
		const keyframes = data.keyframes;
		let i = 0;
		for (let keyframe of keyframes) {
			keyframe.pos = sortedPos[i];
			keyframe.value = sortedValues[i];
			i++;
		}
	}
	computeBounds(target: Box2) {
		const keyframes = this.data.keyframes;
		if (keyframes.length == 0) {
			return;
		}
		const firstPos = keyframes[0].pos;
		const lastPos = keyframes[keyframes.length - 1].pos;
		target.min.set(firstPos, -Infinity);
		target.max.set(lastPos, Infinity);
		let minValue = Infinity;
		let maxValue = -Infinity;
		for (let pos = firstPos; pos <= lastPos; pos++) {
			const value = this.value(pos);
			minValue = Math.min(minValue, value);
			maxValue = Math.max(maxValue, value);
		}
		target.min.y = minValue;
		target.max.y = maxValue;
	}
	compute() {
		Channel.validate(this.data);
		const keyframes = this.data.keyframes;
		if (keyframes.length == 0) {
			return;
		}

		const firstPos = keyframes[0].pos;
		const lastPos = keyframes[keyframes.length - 1].pos;
		this._valuesByPos.clear();

		if (keyframes.length == 0) {
			return;
		}
		if (keyframes.length == 1) {
			this._valuesByPos.set(keyframes[0].pos, keyframes[0].value);
			return;
		}

		let segmentIndex = 0;
		const keyframePair: KeyframePair = {start: keyframes[0], end: keyframes[1]};

		setCubicBezierCurveFromKeyframePair(keyframePair.start, keyframePair.end, curve);
		for (let pos = firstPos; pos <= lastPos; pos++) {
			if (pos > keyframePair.end.pos) {
				segmentIndex++;
				keyframePair.start = keyframePair.end;
				keyframePair.end = keyframes[segmentIndex + 1];
				setCubicBezierCurveFromKeyframePair(keyframePair.start, keyframePair.end, curve);
			}
			const value = this._computeValue(pos, curve);
			this._valuesByPos.set(pos, value);
		}
	}
	private _computeValue(pos: number, curve: CubicBezierCurve): number {
		const t = findTForX(pos, curve);
		curve.getPoint(t, _v2);

		return _v2.y;
	}
}
