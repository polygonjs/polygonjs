/**
 * applies a reverb
 *
 *
 */

import {Reverb} from 'tone/build/esm/effect/Reverb';
const DEFAULTS = {wet: 1, decay: 1.5, preDelay: 0.01};

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	ReverbAudioNode.PARAM_CALLBACK_updateEffect(node as ReverbAudioNode);
};

class ReverbAudioParamsConfig extends NodeParamsConfig {
	/** @param The duration of the reverb. */
	decay = ParamConfig.FLOAT(DEFAULTS.decay, {
		range: [0.001, 10],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	/** The amount of time before the reverb is fully ramped in */
	preDelay = ParamConfig.FLOAT(DEFAULTS.preDelay, {
		range: [0, 1],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
}
const ParamsConfig = new ReverbAudioParamsConfig();

export class ReverbAudioNode extends TypedAudioNode<ReverbAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'reverb';
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
	private __effect__: Reverb | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new Reverb({
			decay: this.pv.decay,
			preDelay: this.pv.preDelay,
		});
	}
	static PARAM_CALLBACK_updateEffect(node: ReverbAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.decay = this.pv.decay;
		effect.preDelay = this.pv.preDelay;
	}
}
