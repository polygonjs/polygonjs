/**
 * creates a meter, which can read the raw value of the signal
 *
 *
 */
import {TypedAudioNode} from './_Base';
import {NodeParamsConfig, ParamConfig} from '../utils/params/ParamsConfig';
import {AudioBuilder} from '../../../core/audio/AudioBuilder';
import {Meter} from 'tone/build/esm/component/analysis/Meter';
import {AudioNodeAnalyzerType} from '../../poly/NodeContext';
import {CoreType, isBooleanTrue} from '../../../core/Type';

class MeterAudioParamsConfig extends NodeParamsConfig {
	/** @param a value from between 0 and 1 where 0 represents no time averaging with the last analysis frame */
	smoothing = ParamConfig.FLOAT(0, {
		range: [0, 1],
		rangeLocked: [true, true],
	});
	/** @param normalizes the output between 0 and 1. The value will be in decibel otherwise. */
	normalRange = ParamConfig.BOOLEAN(1);
	/** @param display meter param */
	updateMeterParam = ParamConfig.BOOLEAN(0);
	/** @param meter value */
	value = ParamConfig.FLOAT(0, {
		visibleIf: {updateMeterParam: 1},
		range: [-100, 100],
		editable: false,
		cook: false,
	});
}
const ParamsConfig = new MeterAudioParamsConfig();

export class MeterAudioNode extends TypedAudioNode<MeterAudioParamsConfig> {
	paramsConfig = ParamsConfig;
	static type() {
		return AudioNodeAnalyzerType.METER;
	}

	initializeNode() {
		this.io.inputs.setCount(1);
	}

	private _meter: Meter | undefined;
	cook(inputContents: AudioBuilder[]) {
		const audioBuilder = inputContents[0];

		this._meter = new Meter({
			smoothing: this.pv.smoothing,
			normalRange: isBooleanTrue(this.pv.normalRange),
		});
		this._updateOnTickHook();

		const inputNode = audioBuilder.audioNode();
		if (inputNode) {
			inputNode.connect(this._meter);
		}
		audioBuilder.setAudioNode(this._meter);

		this.setAudioBuilder(audioBuilder);
	}
	/*
	 * UPDATE METER PARAM
	 */

	private _updateMeterParam() {
		if (!this._meter) {
			return;
		}
		const value = this._meter.getValue();
		if (CoreType.isNumber(value)) {
			this.p.value.set(value);
		} else {
			if (CoreType.isArray(value)) {
				const valueN = value[0];
				// we check that we have a number again in case meter.getValue()
				// returns Infinity
				if (CoreType.isNumber(valueN)) {
					this.p.value.set(valueN);
				}
			}
		}
	}
	/*
	 * REGISTER TICK CALLBACK
	 */
	private _updateOnTickHook() {
		if (isBooleanTrue(this.pv.updateMeterParam)) {
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
