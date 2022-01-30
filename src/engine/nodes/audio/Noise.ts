/**
 * Noise is a noise generator. It uses looped noise buffers to save on performance.
 * Noise supports the noise types: "pink", "white", and "brown". Read more about
 * colors of noise on [Wikipedia](https://en.wikipedia.org/wiki/Colors_of_noise).
 *
 * See description on [Tone.js](https://tonejs.github.io/)
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Noise, NoiseType} from 'tone/build/esm/source/Noise';
import {effectParamsOptions} from './utils/EffectsController';
import {BaseNodeType} from '../_Base';
import {isBooleanTrue} from '../../../core/Type';
const NOISE_TYPES: NoiseType[] = ['white', 'brown', 'pink'];

export const NOISE_DEFAULTS = {
	fadeIn: 0,
	fadeOut: 0,
	mute: false,
	playbackRate: 1,
	// type: "white",
	// volume: 0,
}; //Noise.getDefaults();

const paramCallback = (node: BaseNodeType) => {
	NoiseAudioNode.PARAM_CALLBACK_updateNoise(node as NoiseAudioNode);
};

class NoiseAudioParamsConfig extends NodeParamsConfig {
	/** @param Noise type */
	type = ParamConfig.INTEGER(0, {
		menu: {
			entries: NOISE_TYPES.map((name, value) => ({name, value})),
		},
		...effectParamsOptions(paramCallback),
	});
	/** playbackRate */
	playbackRate = ParamConfig.FLOAT(NOISE_DEFAULTS.playbackRate, {
		range: [0, 1],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	/** fadeIn */
	fadeIn = ParamConfig.FLOAT(NOISE_DEFAULTS.fadeIn as number, {
		range: [0, 1],
		rangeLocked: [true, false],
		...effectParamsOptions(paramCallback),
	});
	/** fadeOut */
	fadeOut = ParamConfig.FLOAT(NOISE_DEFAULTS.fadeOut as number, {
		range: [0, 1],
		rangeLocked: [true, false],
	});
	/** play */
	play = ParamConfig.BOOLEAN(1, effectParamsOptions(paramCallback));
}
const ParamsConfig = new NoiseAudioParamsConfig();

export class NoiseAudioNode extends TypedAudioNode<NoiseAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return 'noise';
	}

	override initializeNode() {
		this.io.inputs.setCount(0);
	}

	override cook(inputContents: AudioBuilder[]) {
		const noise = this._noise();
		this._updateNoise();

		const audioBuilder = new AudioBuilder();
		audioBuilder.setSource(noise);

		this.setAudioBuilder(audioBuilder);
	}

	private __noise__: Noise | undefined;
	private _noise() {
		return (this.__noise__ = this.__noise__ || this._createEffect());
	}
	private _createEffect() {
		return new Noise({
			type: NOISE_TYPES[this.pv.type],
			playbackRate: this.pv.playbackRate,
			fadeIn: this.pv.fadeIn,
			fadeOut: this.pv.fadeOut,
		});
	}
	static PARAM_CALLBACK_updateNoise(node: NoiseAudioNode) {
		node._updateNoise();
	}
	private _updateNoise() {
		const noise = this._noise();
		noise.type = NOISE_TYPES[this.pv.type];
		noise.playbackRate = this.pv.playbackRate;
		noise.fadeIn = this.pv.fadeIn;
		noise.fadeOut = this.pv.fadeOut;

		if (isBooleanTrue(this.pv.play)) {
			noise.start();
		} else {
			noise.stop();
		}
	}
}
