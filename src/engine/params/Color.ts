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
	protected _value_pre_conversion = new Color();
	private _value_serialized_dirty: boolean = false;
	private _value_serialized: Number3 = [0, 0, 0];
	private _value_pre_conversion_serialized: Number3 = [0, 0, 0];
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
		this._update_value_serialized_if_required();
		return this._value_serialized;
	}
	override valuePreConversionSerialized() {
		this._update_value_serialized_if_required();
		return this._value_pre_conversion_serialized;
	}
	private _copied_value: Number3 = [0, 0, 0];
	protected override _copyValue(param: ColorParam) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
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
		this._value_serialized_dirty = true;
	}

	private _update_value_serialized_if_required() {
		if (!this._value_serialized_dirty) {
			return;
		}
		this._value_serialized[0] = this._value.r;
		this._value_serialized[1] = this._value.g;
		this._value_serialized[2] = this._value.b;
		this._value_pre_conversion_serialized[0] = this._value_pre_conversion.r;
		this._value_pre_conversion_serialized[1] = this._value_pre_conversion.g;
		this._value_pre_conversion_serialized[2] = this._value_pre_conversion.b;
	}
	// set_raw_input_from_components() {
	// 	if (this._raw_input instanceof Color) {
	// 		if (
	// 			CoreType.isNumber(this.r.raw_input) &&
	// 			CoreType.isNumber(this.g.raw_input) &&
	// 			CoreType.isNumber(this.b.raw_input)
	// 		) {
	// 			this._raw_input.r = this.r.raw_input;
	// 			this._raw_input.g = this.g.raw_input;
	// 			this._raw_input.b = this.b.raw_input;
	// 		} else {
	// 			this._raw_input = [this.r.raw_input, this.g.raw_input, this.b.raw_input];
	// 		}
	// 	} else {
	// 		this._raw_input[0] = this.r.raw_input;
	// 		this._raw_input[1] = this.g.raw_input;
	// 		this._raw_input[2] = this.b.raw_input;
	// 	}
	// }
	valuePreConversion() {
		return this._value_pre_conversion;
	}

	override set_value_from_components() {
		this._value_pre_conversion.r = this.r.value;
		this._value_pre_conversion.g = this.g.value;
		this._value_pre_conversion.b = this.b.value;

		this._value.copy(this._value_pre_conversion);

		const conversion = this.options.colorConversion();
		if (conversion != null && conversion != ColorConversion.NONE) {
			switch (conversion) {
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
		this._value_serialized_dirty = true;
	}
	// convert(input: ParamInitValuesTypeMap[ParamType.COLOR]): Color | null {
	// 	if (CoreType.isArray(input)) {
	// 		if(input.length == 3){
	// 			if( input.filter(CoreType.isNumber).length > 0 ){
	// 				return new Color().fromArray(input);
	// 			}
	// 			if(first){
	// 				if(CoreType.isNumber(first)){
	// 					return new Color().fromArray(input);
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return new Color();
	// }
}
