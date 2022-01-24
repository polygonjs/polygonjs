/**
 *  Vibrato does near-realtime pitch shifting to the incoming signal.
 * The effect is achieved by speeding up or slowing down the delayTime
 * of a DelayNode using a sawtooth wave.
 * Algorithm found in [this pdf](http://dsp-book.narod.ru/soundproc.pdf).
 * Additional reference by [Miller Pucket](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html).
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 */

import {Vibrato} from 'tone/build/esm/effect/Vibrato';
const DEFAULTS = Vibrato.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

class VibratoAudioParamsConfig extends NodeParamsConfig {
	/** @param maxDelay */
	maxDelay = ParamConfig.FLOAT(DEFAULTS.maxDelay, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** @param frequency */
	frequency = ParamConfig.FLOAT(DEFAULTS.frequency, {
		range: [0, 10],
		rangeLocked: [true, false],
	});
	/** @param depth */
	depth = ParamConfig.FLOAT(DEFAULTS.depth, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new VibratoAudioParamsConfig();

export class VibratoAudioNode extends TypedAudioNode<VibratoAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'vibrato';
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];
		const effect = this._createEffect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(effect);
		}
		audioBuilder.setAudioNode(effect);

		this.setAudioBuilder(audioBuilder);
	}

	private _createEffect() {
		return new Vibrato({
			maxDelay: this.pv.maxDelay,
			frequency: this.pv.frequency,
			depth: this.pv.depth,
		});
	}
}
