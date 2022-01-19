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
import {CoreType, isBooleanTrue} from '../../../core/Type';
import {BaseAnalyserAudioNode} from './_BaseAnalyser';
import {Number2} from '../../../types/GlobalTypes';
const DEFAULTS = FFT.getDefaults();

const paramCallback = (node: BaseNodeType) => {
	FFTAudioNode.PARAM_CALLBACK_updateEffect(node as FFTAudioNode);
};

const RANGE_DEFAULT: Number2 = [10000, -10000];

class FFTAudioParamsConfig extends NodeParamsConfig {
	/** @param array size will be 2**sizeExponent */
	sizeExponent = ParamConfig.INTEGER(8, {
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
		...effectParamsOptions(paramCallback),
	});
	/** @param normalizes the output between 0 and 1. The value will be in decibel otherwise. */
	normalRange = ParamConfig.BOOLEAN(0, effectParamsOptions(paramCallback));
	/** @param display range param */
	updateRangeParam = ParamConfig.BOOLEAN(0, {
		cook: false,
		callback: (node: BaseNodeType) => {
			FFTAudioNode.PARAM_CALLBACK_updateUpdateRangeParam(node as FFTAudioNode);
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
			FFTAudioNode.PARAM_CALLBACK_resetMaxRange(node as FFTAudioNode);
		},
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
		this._updateOnTickHook();

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

	/*
	 * UPDATE RANGE PARAM
	 */
	static PARAM_CALLBACK_updateUpdateRangeParam(node: FFTAudioNode) {
		node._updateRangeParam();
		node._updateOnTickHook();
	}
	static PARAM_CALLBACK_resetMaxRange(node: FFTAudioNode) {
		node.p.maxRange.set(RANGE_DEFAULT);
	}

	private _updateRangeParam() {
		if (!this.__effect__) {
			return;
		}
		const values = this.__effect__.getValue();
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
