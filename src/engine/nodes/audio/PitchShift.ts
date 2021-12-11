/**
 * applies a reverb
 *
 *
 */

import {PitchShift} from 'tone/build/esm/effect/PitchShift';
const DEFAULTS = {delayTime: 0, feedback: 0, pitch: 0, wet: 1, windowSize: 0.1};

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
	paramsConfig = ParamsConfig;
	static type() {
		return 'pitchShift';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
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
