import {ChannelData, KeyframeData, ChannelInterpolation, SetCurveCallback, GetValueCallback} from './KeyframeCommon';
import {setCurveFromKeyframePairCubic, getValueCubic} from './channel/Cubic';
import {setCurveFromKeyframePairLinear, getValueLinear} from './channel/Linear';
import {mix} from '../math/_Module';
import {MapUtils} from '../MapUtils';
import {copyKeyframeData, createKeyframeData} from './KeyframeSerialize';

interface KeyframePair {
	start: KeyframeData;
	end: KeyframeData;
}
// const _v2 = new Vector2();

export class Channel {
	private _valuesByPos: Map<number, number> = new Map();
	protected _setCurveCallback: SetCurveCallback = setCurveFromKeyframePairLinear;
	protected _getValueCallback: GetValueCallback = getValueLinear;
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
		let keyframes = data.keyframes;

		const keyframesByPos: Map<number, KeyframeData[]> = new Map();
		for (const keyframe of keyframes) {
			MapUtils.pushOnArrayAtEntry(keyframesByPos, keyframe.pos, keyframe);
		}

		// if we have keyframes that need to be merged, adjust the sizes of the arrays
		if (keyframes.length != keyframesByPos.size) {
			const expectedSize = keyframesByPos.size;
			const keptKeyframes: KeyframeData[] = new Array(expectedSize);
			let i = 0;
			keyframesByPos.forEach((keyframes, pos) => {
				keptKeyframes[i] = keyframes[0];
				i++;
			});
			keyframes = keptKeyframes;
			data.keyframes.splice(expectedSize, data.keyframes.length - expectedSize);
		}

		// sort by replacing the values, not just swapping the keyframe data objects
		const sortedKeyframes = keyframes
			.sort((k1, k2) => k1.pos - k2.pos)
			.map((k) => {
				const target = createKeyframeData();
				copyKeyframeData(k, target);
				return target;
			});
		let i = 0;
		for (const keyframe of sortedKeyframes) {
			copyKeyframeData(keyframe, data.keyframes[i]);
			i++;
		}
	}

	private _setCallbacks() {
		switch (this.data.interpolation) {
			case ChannelInterpolation.CUBIC: {
				this._setCurveCallback = setCurveFromKeyframePairCubic;
				this._getValueCallback = getValueCubic;
				return;
			}
			case ChannelInterpolation.LINEAR: {
				this._setCurveCallback = setCurveFromKeyframePairLinear;
				this._getValueCallback = getValueLinear;
				return;
			}
		}
	}
	compute() {
		Channel.validate(this.data);
		const keyframes = this.data.keyframes;
		if (keyframes.length == 0) {
			return;
		}
		this._setCallbacks();

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

		this._setCurveCallback(keyframePair.start, keyframePair.end);
		for (let pos = firstPos; pos <= lastPos; pos++) {
			if (pos > keyframePair.end.pos) {
				segmentIndex++;
				keyframePair.start = keyframePair.end;
				keyframePair.end = keyframes[segmentIndex + 1];
				this._setCurveCallback(keyframePair.start, keyframePair.end);
			}
			const value = this._getValueCallback(pos);
			this._valuesByPos.set(pos, value);
		}
	}
	// private _computeValue(pos: number, curve: CubicBezierCurve): number {
	// 	const t = this._findTForXCallback(pos, curve);
	// 	curve.getPoint(t, _v2);
	// 	console.log(pos, t, _v2.x, _v2.y);

	// 	return _v2.y;
	// }
}
