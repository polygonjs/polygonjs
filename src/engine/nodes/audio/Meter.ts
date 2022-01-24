/**
 * creates a meter, which can read the raw value of the signal
 *
 *
 */
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Meter} from 'tone/build/esm/component/analysis/Meter';
import {AudioNodeAnalyserType} from '../../poly/NodeContext';
import {CoreType, isBooleanTrue} from '../../../core/Type';
import {effectParamsOptions} from './utils/EffectsController';
import {BaseNodeType} from '../_Base';
import {BaseAnalyserAudioNode} from './_BaseAnalyser';
import {Number2} from '../../../types/GlobalTypes';
const DEFAULTS = Meter.getDefaults();

const paramCallback = (node: BaseNodeType) => {
	MeterAudioNode.PARAM_CALLBACK_updateEffect(node as MeterAudioNode);
};

const RANGE_DEFAULT: Number2 = [10000, -10000];
class MeterAudioParamsConfig extends NodeParamsConfig {
	/** @param a value from between 0 and 1 where 0 represents no time averaging with the last analysis frame */
	smoothing = ParamConfig.FLOAT(DEFAULTS.smoothing, {
		range: [0, 1],
		rangeLocked: [true, true],
		...effectParamsOptions(paramCallback),
	});
	/** @param normalizes the output between 0 and 1. The value will be in decibel otherwise. */
	normalRange = ParamConfig.BOOLEAN(0, effectParamsOptions(paramCallback));
	/** @param display meter param */
	updateRangeParam = ParamConfig.BOOLEAN(0, {
		cook: false,
		callback: (node: BaseNodeType) => {
			MeterAudioNode.PARAM_CALLBACK_updateUpdateMeterParam(node as MeterAudioNode);
		},
	});
	/** @param meter value */
	value = ParamConfig.FLOAT(0, {
		visibleIf: {updateRangeParam: 1},
		range: [-100, 100],
		editable: false,
		cook: false,
	});
	/** @param accumulated range */
	maxRange = ParamConfig.VECTOR2([10000, -10000], {
		visibleIf: {updateRangeParam: 1},
		editable: false,
		cook: false,
	});
	/** @param resetMaxRange */
	resetMaxRange = ParamConfig.BUTTON(null, {
		visibleIf: {updateRangeParam: 1},
		callback: (node) => {
			MeterAudioNode.PARAM_CALLBACK_resetMaxRange(node as MeterAudioNode);
		},
	});
}
const ParamsConfig = new MeterAudioParamsConfig();

export class MeterAudioNode extends BaseAnalyserAudioNode<MeterAudioParamsConfig> {
	override paramsConfig = ParamsConfig;
	static override type() {
		return AudioNodeAnalyserType.METER;
	}

	override initializeNode() {
		this.io.inputs.setCount(1);
	}

	override cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		this._resetEffect();
		const meter = this._effect();
		this._updateOnTickHook();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(meter);
		}
		audioBuilder.setAudioNode(meter);

		this.setAudioBuilder(audioBuilder);
	}
	private _numberValue = new Float32Array(1);
	getAnalyserValue() {
		if (this.__effect__) {
			const value = this.__effect__.getValue();
			if (CoreType.isNumber(value)) {
				this._numberValue[0] = value;
				return this._numberValue;
			} else {
				return value;
			}
		}
	}
	private __effect__: Meter | undefined;
	private _effect() {
		return (this.__effect__ = this.__effect__ || this._createEffect());
	}
	private _createEffect() {
		return new Meter({
			smoothing: this.pv.smoothing,
			normalRange: isBooleanTrue(this.pv.normalRange),
		});
	}
	private _resetEffect() {
		if (this.__effect__) {
			this.__effect__.dispose();
			this.__effect__ = undefined;
		}
	}
	static PARAM_CALLBACK_updateEffect(node: MeterAudioNode) {
		node._updateEffect();
	}
	private _updateEffect() {
		const effect = this._effect();
		effect.normalRange = isBooleanTrue(this.pv.normalRange);
		effect.smoothing = this.pv.smoothing;
	}
	/*
	 * UPDATE METER PARAM
	 */
	static PARAM_CALLBACK_updateUpdateMeterParam(node: MeterAudioNode) {
		node._updateMeterParam();
		node._updateOnTickHook();
	}
	static PARAM_CALLBACK_resetMaxRange(node: MeterAudioNode) {
		node.p.maxRange.set(RANGE_DEFAULT);
	}

	private _updateMeterParam() {
		if (!this.__effect__) {
			return;
		}
		const value = this.__effect__.getValue();
		if (CoreType.isNumber(value) && isFinite(value)) {
			this.p.value.set(value);
		} else {
			if (CoreType.isArray(value)) {
				const valueN = value[0];
				// we check that we have a number again in case meter.getValue()
				// returns Infinity
				if (CoreType.isNumber(valueN) && isFinite(valueN)) {
					this.p.value.set(valueN);
				}
			}
		}
		// update max range
		const newVal = this.pv.value;
		if (newVal < this.pv.maxRange.x && CoreType.isNumber(newVal) && isFinite(newVal)) {
			this.p.maxRange.x.set(newVal);
		} else {
			if (newVal > this.pv.maxRange.y && CoreType.isNumber(newVal) && isFinite(newVal)) {
				this.p.maxRange.y.set(newVal);
			}
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
		this.scene().registerOnBeforeTick(this._tickCallbackName(), this._updateMeterParam.bind(this));
	}
	private async _unRegisterOnTickHook() {
		this.scene().unRegisterOnBeforeTick(this._tickCallbackName());
	}
	private _tickCallbackName() {
		return `audio/Meter-${this.graphNodeId()}`;
	}
}
