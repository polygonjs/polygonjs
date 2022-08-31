import {Number3, StringOrNumber3} from '../../types/GlobalTypes';
import {TypedMultipleParam} from './_Multiple';
import {Color} from 'three';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ColorConversion} from '../../core/Color';
import {TypeAssert} from '../poly/Assert';
import {CoreType} from '../../core/Type';

const COMPONENT_NAMES_COLOR: Readonly<string[]> = ['r', 'g', 'b'];
const tmp: Number3 = [0, 0, 0];
export class ColorParam extends TypedMultipleParam<ParamType.COLOR> {
	protected override _value = new Color();
	private _valuePreConversion = new Color();
	private _valueSerializedDirty: boolean = false;
	private _valueSerialized: Number3 = [0, 0, 0];
	private _valuePreConversionSerialized: Number3 = [0, 0, 0];
	r!: FloatParam;
	g!: FloatParam;
	b!: FloatParam;
	static override type() {
		return ParamType.COLOR;
	}
	override componentNames(): Readonly<string[]> {
		return COMPONENT_NAMES_COLOR;
	}
	override defaultValueSerialized() {
		if (CoreType.isArray(this._default_value)) {
			return this._default_value;
		} else {
			return this._default_value.toArray() as Number3;
		}
	}
	override _prefilterInvalidRawInput(rawInput: any) {
		if (rawInput instanceof Color) {
			rawInput.toArray(tmp);
			return tmp;
		}
		return super._prefilterInvalidRawInput(rawInput);
	}
	// rawInputSerialized() {
	// 	if (this._raw_input instanceof Color) {
	// 		return this._raw_input.toArray() as Number3;
	// 	} else {
	// 		const new_array: StringOrNumber3 = [this._raw_input[0], this._raw_input[1], this._raw_input[2]];
	// 		return new_array;
	// 	}
	// }
	override valueSerialized() {
		this._updateValueSerializedIfRequired();
		return this._valueSerialized;
	}
	override valuePreConversionSerialized() {
		this._updateValueSerializedIfRequired();
		return this._valuePreConversionSerialized;
	}
	private _copiedValue: Number3 = [0, 0, 0];
	protected override _copyValue(param: ColorParam) {
		param.value.toArray(this._copiedValue);
		this.set(this._copiedValue);
	}
	// protected _prefilterInvalidRawInput(
	// 	raw_input: ParamInitValuesTypeMap[ParamType.COLOR]
	// ): ParamInitValuesTypeMap[ParamType.COLOR] {
	// 	return raw_input;
	// }
	protected override _cloneRawInput(raw_input: ParamInitValuesTypeMap[ParamType.COLOR]) {
		if (raw_input instanceof Color) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber3 = [raw_input[0], raw_input[1], raw_input[2]];
			// in case array elements are undefined
			if (new_array[0] == null) {
				new_array[0] = new_array[0] || 0;
			}
			if (new_array[1] == null) {
				new_array[1] = new_array[1] || new_array[0];
			}
			if (new_array[2] == null) {
				new_array[2] = new_array[2] || new_array[1];
			}
			return new_array;
		}
	}
	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.COLOR],
		raw_input2: ParamInitValuesTypeMap[ParamType.COLOR]
	) {
		if (raw_input1 instanceof Color) {
			if (raw_input2 instanceof Color) {
				return raw_input1.equals(raw_input2);
			} else {
				return raw_input1.r == raw_input2[0] && raw_input1.g == raw_input2[1] && raw_input1.b == raw_input2[2];
			}
		} else {
			if (raw_input2 instanceof Color) {
				return raw_input1[0] == raw_input2.r && raw_input1[1] == raw_input2.g && raw_input1[2] == raw_input2.b;
			} else {
				return (
					raw_input1[0] == raw_input2[0] && raw_input1[1] == raw_input2[1] && raw_input1[2] == raw_input2[2]
				);
			}
		}
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.COLOR],
		val2: ParamValuesTypeMap[ParamType.COLOR]
	) {
		return val1.equals(val2);
	}
	override initComponents() {
		super.initComponents();
		this.r = this.components[0];
		this.g = this.components[1];
		this.b = this.components[2];
		this._valueSerializedDirty = true;
		// this.options.onOptionChange('conversion', () => {
		// 	this.setValueFromComponents();
		// });
	}
	override postOptionsInitialize() {
		this.setValueFromComponents();
	}

	private _updateValueSerializedIfRequired() {
		if (!this._valueSerializedDirty) {
			return;
		}
		this._valueSerialized[0] = this._value.r;
		this._valueSerialized[1] = this._value.g;
		this._valueSerialized[2] = this._value.b;
		this._valuePreConversionSerialized[0] = this._valuePreConversion.r;
		this._valuePreConversionSerialized[1] = this._valuePreConversion.g;
		this._valuePreConversionSerialized[2] = this._valuePreConversion.b;
	}

	valuePreConversion() {
		return this._valuePreConversion;
	}

	override setValueFromComponents() {
		this._valuePreConversion.r = this.r.value;
		this._valuePreConversion.g = this.g.value;
		this._valuePreConversion.b = this.b.value;
		this._value.copy(this._valuePreConversion);

		this._applyColorConversion();

		this._valueSerializedDirty = true;
	}
	private _applyColorConversion() {
		const conversion = this.options.colorConversion();

		switch (conversion) {
			case ColorConversion.NONE: {
				return;
			}
			case ColorConversion.SRGB_TO_LINEAR: {
				this._value.convertSRGBToLinear();
				return;
			}
			case ColorConversion.LINEAR_TO_SRGB: {
				this._value.convertLinearToSRGB();
				return;
			}
		}
		TypeAssert.unreachable(conversion);
	}
}
