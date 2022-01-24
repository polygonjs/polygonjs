/**
 * applies a Chorus
 *
 *
 */

import {Chorus} from 'tone/build/esm/effect/Chorus';
const DEFAULTS = {delayTime: 3.5, depth: 0.7, feedback: 0, frequency: 1.5, spread: 180, type: 'sine', wet: 0.5};

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	ChorusAudioNode.PARAM_CALLBACK_updateEffect(node as ChorusAudioNode);
};

class ChorusAudioParamsConfig extends NodeParamsConfig {
	/** @param The frequency of the LFO. */
	frequency = ParamConfig.FLOAT(DEFAULTS.frequency, {
		range: [0, 10],
		rangeLocked: [true, false],
		// no callback allowed for frequency as it is a readonly property
		// ...effectParamsOptions(paramCallback),
	});
	/** The delay of the chorus effect in ms */
	delayTime = ParamConfig.FLOAT(DEFAULTS.delayTime, {
		range: [0, 1],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	/** The depth of the chorus */
	depth = ParamConfig.FLOAT(DEFAULTS.depth, {
		range: [0, 1],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
}
const ParamsConfig = new ChorusAudioParamsConfig();

export class ChorusAudioNode extends TypedAudioNode<ChorusAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'chorus';
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
	private __effect__: Chorus | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new Chorus({
			frequency: this.pv.frequency,
			delayTime: this.pv.delayTime,
			depth: this.pv.depth,
		});
	}
	static PARAM_CALLBACK_updateEffect(node: ChorusAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		// effect.frequency = this.pv.frequency;
		effect.delayTime = this.pv.delayTime;
		effect.depth = this.pv.depth;
	}
}
