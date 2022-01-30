/**
 * AutoFilter is a Tone.Filter with a Tone.LFO connected to the filter cutoff frequency.
 * Setting the LFO rate and depth allows for control over the filter modulation rate
 * and depth.
 *
 *
 */

import {AutoFilter} from 'tone/build/esm/effect/AutoFilter';
/* do not use AutoFilter.getDefaults() as it otherwise tries to start the AudioContext*/
const DEFAULTS = {
	baseFrequency: 200,
	// depth: 1,
	// frequency: 1,
	octaves: 2.6,
	// type: 'sine',
	// wet: 1,
};
/*
baseFrequency: Frequency;
octaves: Positive;
filter: Omit<FilterOptions, keyof SourceOptions | "frequency" | "detune" | "gain">;
*/

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	AutoFilterAudioNode.PARAM_CALLBACK_updateEffect(node as AutoFilterAudioNode);
};

class AutoFilterAudioParamsConfig extends NodeParamsConfig {
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
	// TODO: promote filter params
}
const ParamsConfig = new AutoFilterAudioParamsConfig();

export class AutoFilterAudioNode extends TypedAudioNode<AutoFilterAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'autoFilter';
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
	private __effect__: AutoFilter | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new AutoFilter({
			baseFrequency: this.pv.baseFrequency,
			octaves: this.pv.octaves,
		});
	}
	static PARAM_CALLBACK_updateEffect(node: AutoFilterAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.baseFrequency = this.pv.baseFrequency;
		effect.octaves = this.pv.octaves;
	}
}
