/**
 * creates a fast fourier transform analyser
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {FFT} from 'tone/build/esm/component/analysis/FFT';
import {AudioNodeAnalyserType} from '../../poly/NodeContext';
import {BaseNodeType} from '../_Base';
import {effectParamsOptions} from './utils/EffectsController';
import {isBooleanTrue} from '../../../core/Type';
import {BaseAnalyserAudioNode} from './_BaseAnalyser';
const DEFAULTS = FFT.getDefaults();

const paramCallback = (node: BaseNodeType) => {
	FFTAudioNode.PARAM_CALLBACK_updateEffect(node as FFTAudioNode);
};

class FFTAudioParamsConfig extends NodeParamsConfig {
	/** @param array size will be 2**sizeExponent */
	sizeExponent = ParamConfig.INTEGER(8, {
		range: [4, 14],
		rangeLocked: [true, true],
	});
	/** @param normalizes the output between 0 and 1. The value will be in decibel otherwise. */
	normalRange = ParamConfig.BOOLEAN(0, effectParamsOptions(paramCallback));
	/** @param a value from between 0 and 1 where 0 represents no time averaging with the last analysis frame */
	smoothing = ParamConfig.FLOAT(DEFAULTS.smoothing, {
		range: [0, 1],
		rangeLocked: [true, true],
		...effectParamsOptions(paramCallback),
	});
}
const ParamsConfig = new FFTAudioParamsConfig();

export class FFTAudioNode extends BaseAnalyserAudioNode<FFTAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return AudioNodeAnalyserType.FFT;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		this._resetEffect();
		const fft = this._effect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(fft);
		}
		audioBuilder.setAudioNode(fft);

		this.setAudioBuilder(audioBuilder);
	}
	getAnalyserValue() {
		if (this.__effect__) {
			return this.__effect__.getValue();
		}
	}
	private __effect__: FFT | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new FFT({
			size: this._FFTSize(),
			normalRange: isBooleanTrue(this.pv.normalRange),
			smoothing: this.pv.smoothing,
		});
	}
	private _resetEffect() {
		if (this.__effect__) {
			this.__effect__.dispose();
			this.__effect__ = undefined;
		}
	}
	static PARAM_CALLBACK_updateEffect(node: FFTAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.normalRange = isBooleanTrue(this.pv.normalRange);
		effect.smoothing = this.pv.smoothing;
	}
	private _FFTSize() {
		return 2 ** this.pv.sizeExponent;
	}
}
