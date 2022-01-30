/**
 * AutoWah connects a [[Follower]] to a [[Filter]].
 * The frequency of the filter, follows the input amplitude curve.
 *
 *
 */

import {AutoWah} from 'tone/build/esm/effect/AutoWah';
const DEFAULTS = {
	// Q: 2,
	baseFrequency: 100,
	follower: 0.2,
	// gain: 2,
	octaves: 6,
	sensitivity: 0,
	// wet: 1,
}; //AutoWah.getDefaults();
/*
 baseFrequency: Frequency;
    octaves: Positive;
    sensitivity: Decibels;
    Q: Positive;
    gain: GainFactor;
    follower: Time;
 */

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	AutoWahAudioNode.PARAM_CALLBACK_updateEffect(node as AutoWahAudioNode);
};

class AutoWahAudioParamsConfig extends NodeParamsConfig {
	/** @param baseFrequency */
	baseFrequency = ParamConfig.FLOAT(DEFAULTS.baseFrequency, {
		range: [0, 1000],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	/** @param octaves */
	octaves = ParamConfig.FLOAT(DEFAULTS.octaves, {
		range: [0, 10],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	/** @param sensitivity */
	sensitivity = ParamConfig.FLOAT(DEFAULTS.sensitivity, {
		range: [0, 1],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	/** @param follower */
	follower = ParamConfig.FLOAT(DEFAULTS.follower as number, {
		range: [0, 1],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	// TODO: promote filter params
}
const ParamsConfig = new AutoWahAudioParamsConfig();

export class AutoWahAudioNode extends TypedAudioNode<AutoWahAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'autoWah';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		const effect = this._effect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}
	private __effect__: AutoWah | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new AutoWah({
			baseFrequency: this.pv.baseFrequency,
			octaves: this.pv.octaves,
			sensitivity: this.pv.sensitivity,
			// Q: this.pv.Q,
			// gain: this.pv.gain,
			follower: this.pv.follower,
		});
	}
	static PARAM_CALLBACK_updateEffect(node: AutoWahAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.baseFrequency = this.pv.baseFrequency;
		effect.octaves = this.pv.octaves;
		effect.sensitivity = this.pv.sensitivity;
		// effect.Q = this.pv.Q;
		// effect.gain = this.pv.gain;
		effect.follower = this.pv.follower;
	}
}
