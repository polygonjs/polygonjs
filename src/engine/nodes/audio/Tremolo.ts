/**
 *  Tremolo does near-realtime pitch shifting to the incoming signal.
 * The effect is achieved by speeding up or slowing down the delayTime
 * of a DelayNode using a sawtooth wave.
 * Algorithm found in [this pdf](http://dsp-book.narod.ru/soundproc.pdf).
 * Additional reference by [Miller Pucket](http://msp.ucsd.edu/techniques/v0.11/book-html/node115.html).
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 */

import {Tremolo} from 'tone/build/esm/effect/Tremolo';
const DEFAULTS = {
	depth: 0.5,
	frequency: 10,
	spread: 180,
	// type: "sine"
}; //Tremolo.getDefaults();

import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';

class TremoloAudioParamsConfig extends NodeParamsConfig {
	/** @param frequency */
	frequency = ParamConfig.FLOAT(DEFAULTS.frequency, {
		range: [0, 1000],
		rangeLocked: [true, false],
	});
	/** @param depth */
	depth = ParamConfig.FLOAT(DEFAULTS.depth, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param spread (degrees) */
	spread = ParamConfig.FLOAT(DEFAULTS.spread, {
		range: [-180, 180],
		rangeLocked: [true, true],
	});
}
const ParamsConfig = new TremoloAudioParamsConfig();

export class TremoloAudioNode extends TypedAudioNode<TremoloAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'tremolo';
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
		return new Tremolo({
			frequency: this.pv.frequency,
			depth: this.pv.depth,
			spread: this.pv.spread,
		});
	}
}
