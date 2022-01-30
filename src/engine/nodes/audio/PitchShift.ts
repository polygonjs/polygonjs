/**
 *  PitchShift does near-realtime pitch shifting to the incoming signal.
 * The effect is achieved by speeding up or slowing down the delayTime
 * of a DelayNode using a sawtooth wave.
 * Algorithm found in [this pdf](http://dsp-book.narod.ru/soundproc.pdf).
 * Additional reference by [Miller Pucket](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html).
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 */

import {PitchShift} from 'tone/build/esm/effect/PitchShift';
const DEFAULTS = {
	// 	delayTime: 0,
	// feedback: 0,
	pitch: 0,
}; //PitchShift.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	PitchShiftAudioNode.PARAM_CALLBACK_updateEffect(node as PitchShiftAudioNode);
};

class PitchShiftAudioParamsConfig extends NodeParamsConfig {
	/** @param The interval to transpose the incoming signal by */
	pitch = ParamConfig.FLOAT(DEFAULTS.pitch, {
		range: [0, 10],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
}
const ParamsConfig = new PitchShiftAudioParamsConfig();

export class PitchShiftAudioNode extends TypedAudioNode<PitchShiftAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'pitchShift';
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
	private __effect__: PitchShift | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new PitchShift(this.pv.pitch);
	}
	static PARAM_CALLBACK_updateEffect(node: PitchShiftAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.pitch = this.pv.pitch;
	}
}
