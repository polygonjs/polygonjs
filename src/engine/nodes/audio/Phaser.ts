/**
 * Phaser is a phaser effect. Phasers work by changing the phase
 * of different frequency components of an incoming signal. Read more on
 * [Wikipedia](https://en.wikipedia.org/wiki/Phaser_(effect)).
 * Inspiration for this phaser comes from [Tuna.js](https://github.com/Dinahmoe/tuna/).
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 */

import {Phaser} from 'tone/build/esm/effect/Phaser';
const DEFAULTS = Phaser.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';

const paramCallback = (node: BaseNodeType) => {
	PhaserAudioNode.PARAM_CALLBACK_updateEffect(node as PhaserAudioNode);
};

class PhaserAudioParamsConfig extends NodeParamsConfig {
	/** @param frequency */
	frequency = ParamConfig.FLOAT(DEFAULTS.frequency, {
		range: [0, 1000],
		rangeLocked: [true, false],
	});
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
	stages = ParamConfig.FLOAT(DEFAULTS.stages, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param Q */
	Q = ParamConfig.FLOAT(DEFAULTS.Q, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
}
const ParamsConfig = new PhaserAudioParamsConfig();

export class PhaserAudioNode extends TypedAudioNode<PhaserAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return 'phaser';
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		this._resetEffect();
		const effect = this._effect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}
	private __effect__: Phaser | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new Phaser({
			frequency: this.pv.frequency,
			baseFrequency: this.pv.baseFrequency,
			octaves: this.pv.octaves,
			stages: this.pv.stages,
			Q: this.pv.Q,
		});
	}
	private _resetEffect() {
		if (this.__effect__) {
			this.__effect__.dispose();
			this.__effect__ = undefined;
		}
	}
	static PARAM_CALLBACK_updateEffect(node: PhaserAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.baseFrequency = this.pv.baseFrequency;
		effect.octaves = this.pv.octaves;
	}
}
