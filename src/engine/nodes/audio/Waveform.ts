/**
 * Get the current waveform data of the connected audio source
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Waveform} from 'tone/build/esm/component/analysis/Waveform';
import {AudioNodeAnalyserType} from '../../poly/NodeContext';
import {BaseAnalyserAudioNode} from './_BaseAnalyser';
import {dbToGain} from 'tone/build/esm/core/type/Conversions';
import {isBooleanTrue} from '../../../core/Type';

// const paramCallback = (node: BaseNodeType) => {
// 	WaveformAudioNode.PARAM_CALLBACK_updateEffect(node as WaveformAudioNode);
// };
// class Waveform2 extends Waveform {
// 	getAnalyser() {
// 		return this._analyser;
// 	}
// }

class WaveformAudioParamsConfig extends NodeParamsConfig {
	/** @param array size will be 2**sizeExponent */
	sizeExponent = ParamConfig.INTEGER(8, {
		range: [4, 14],
		rangeLocked: [true, true],
	});
	/** @param a value from between 0 and 1 where 0 represents no time averaging with the last analysis frame */
	smoothing = ParamConfig.FLOAT(0.8, {
		range: [0, 1],
		rangeLocked: [true, true],
		cook: false,
		// ...effectParamsOptions(paramCallback),
	});
	/** @param normalizes the output between 0 and 1. The value will be in decibel otherwise. */
	normalRange = ParamConfig.BOOLEAN(1, {
		cook: false,
		// ...effectParamsOptions(paramCallback)
	});
}
const ParamsConfig = new WaveformAudioParamsConfig();

export class WaveformAudioNode extends BaseAnalyserAudioNode<WaveformAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return AudioNodeAnalyserType.WAVEFORM;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		this._resetEffect();
		const waveform = this._effect();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(waveform);
		}
		audioBuilder.setAudioNode(waveform);

		this.setAudioBuilder(audioBuilder);
	}
	private _previousValue: Float32Array | undefined;
	getAnalyserValue() {
		const currentValue = this._getWaveFormValue();
		if (!currentValue) {
			return;
		}
		const blendedValue =
			this._previousValue != null && currentValue.length == this._previousValue.length
				? this._blendValue(currentValue, this._previousValue)
				: currentValue;

		if (!this._previousValue || currentValue.length != this._previousValue.length) {
			this._previousValue = new Float32Array(currentValue.length);
		}

		this._previousValue.set(currentValue);
		return blendedValue;
	}
	private _getWaveFormValue() {
		if (this.__effect__) {
			const values = this.__effect__.getValue();
			if (isBooleanTrue(this.pv.normalRange)) {
				return values.map((v) => dbToGain(v));
			} else {
				return values;
			}
		}
	}
	private _blendValue(currentValue: Float32Array, previousValue: Float32Array) {
		const smoothing = this.pv.smoothing;
		if (smoothing == 0) {
			return currentValue;
		}
		if (smoothing == 1) {
			return previousValue;
		}
		const count = currentValue.length;
		for (let i = 0; i < count; i++) {
			currentValue[i] = smoothing * previousValue[i] + (1 - smoothing) * currentValue[i];
		}
		return currentValue;
	}

	private __effect__: Waveform | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		const effect = new Waveform({
			size: this._effectSize(),
		});
		// Using the smoothing here does not seem to work.
		// so I blend the value instead in .getAnalyserValue
		// const analyser = effect.getAnalyser();
		// analyser.smoothing = this.pv.smoothing;

		return effect;
	}
	private _resetEffect() {
		if (this.__effect__) {
			this.__effect__.dispose();
			this.__effect__ = undefined;
		}
	}
	// static PARAM_CALLBACK_updateEffect(node: WaveformAudioNode) {
	// 	node._updateEffect();
	// }
	// private _updateEffect() {
	// 	// const effect = this._effect();
	// 	// const analyser = effect.getAnalyser();
	// 	// analyser.smoothing = this.pv.smoothing;
	// }
	private _effectSize() {
		return 2 ** this.pv.sizeExponent;
	}
}
