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
import {CoreType, isBooleanTrue} from '../../../core/Type';
import {BaseNodeType} from '../_Base';
import {Number2} from '../../../types/GlobalTypes';

const DEFAULTS = {
	// normalRange: false,
	size: 1024,
	smoothing: 0.8,
}; //FFT.getDefaults();

const RANGE_DEFAULT: Number2 = [10000, -10000];
class WaveformAudioParamsConfig extends NodeParamsConfig {
	/** @param array size will be 2**sizeExponent */
	sizeExponent = ParamConfig.INTEGER(10, {
		range: [4, 14],
		rangeLocked: [true, true],
	});
	/** @param array size */
	arraySize = ParamConfig.INTEGER(`2**ch('sizeExponent')`, {
		editable: false,
	});
	/** @param a value from between 0 and 1 where 0 represents no time averaging with the last analysis frame */
	smoothing = ParamConfig.FLOAT(DEFAULTS.smoothing, {
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
	/** @param display range param */
	updateRangeParam = ParamConfig.BOOLEAN(0, {
		cook: false,
		callback: (node: BaseNodeType) => {
			WaveformAudioNode.PARAM_CALLBACK_updateUpdateRangeParam(node as WaveformAudioNode);
		},
	});
	/** @param range value */
	range = ParamConfig.VECTOR2([0, 0], {
		visibleIf: {updateRangeParam: 1},
		editable: false,
		cook: false,
	});
	/** @param accumulated range */
	maxRange = ParamConfig.VECTOR2(RANGE_DEFAULT, {
		visibleIf: {updateRangeParam: 1},
		editable: false,
		cook: false,
	});
	/** @param resetMaxRange */
	resetMaxRange = ParamConfig.BUTTON(null, {
		visibleIf: {updateRangeParam: 1},
		callback: (node) => {
			WaveformAudioNode.PARAM_CALLBACK_resetMaxRange(node as WaveformAudioNode);
		},
	});
}
const ParamsConfig = new WaveformAudioParamsConfig();

export class WaveformAudioNode extends BaseAnalyserAudioNode<WaveformAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return AudioNodeAnalyserType.WAVEFORM;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		this._resetEffect();
		const waveform = this._effect();
		this._updateOnTickHook();

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

	/*
	 * UPDATE RANGE PARAM
	 */
	static PARAM_CALLBACK_updateUpdateRangeParam(node: WaveformAudioNode) {
		node._updateRangeParam();
		node._updateOnTickHook();
	}
	static PARAM_CALLBACK_resetMaxRange(node: WaveformAudioNode) {
		node.p.maxRange.set(RANGE_DEFAULT);
	}

	private _updateRangeParam() {
		if (!this.__effect__) {
			return;
		}
		const values = this.getAnalyserValue();
		if (!values) {
			return;
		}
		const min = Math.min(...values);
		const max = Math.max(...values);
		this.p.range.set([min, max]);

		if (min < this.pv.maxRange.x && CoreType.isNumber(min) && isFinite(min)) {
			this.p.maxRange.x.set(min);
		}
		if (max > this.pv.maxRange.y && CoreType.isNumber(max) && isFinite(max)) {
			this.p.maxRange.y.set(max);
		}
	}
	/*
	 * REGISTER TICK CALLBACK
	 */
	private _updateOnTickHook() {
		if (isBooleanTrue(this.pv.updateRangeParam)) {
			this._registerOnTickHook();
		} else {
			this._unRegisterOnTickHook();
		}
	}
	private async _registerOnTickHook() {
		if (this.scene().registeredBeforeTickCallbacks().has(this._tickCallbackName())) {
			return;
		}
		this.scene().registerOnBeforeTick(this._tickCallbackName(), this._updateRangeParam.bind(this));
	}
	private async _unRegisterOnTickHook() {
		this.scene().unRegisterOnBeforeTick(this._tickCallbackName());
	}
	private _tickCallbackName() {
		return `audio/FFT-${this.graphNodeId()}`;
	}
}
