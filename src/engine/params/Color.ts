import {Number3, StringOrNumber3} from '../../types/GlobalTypes';
import {TypedMultipleParam} from './_Multiple';
import {Color} from 'three/src/math/Color';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ColorConversion} from '../../core/Color';
import {TypeAssert} from '../poly/Assert';
import {CoreType} from '../../core/Type';

const COMPONENT_NAMES_COLOR: Readonly<string[]> = ['r', 'g', 'b'];
export class ColorParam extends TypedMultipleParam<ParamType.COLOR> {
	protected _value = new Color();
	protected _value_pre_conversion = new Color();
	private _value_serialized_dirty: boolean = false;
	private _value_serialized: Number3 = [0, 0, 0];
	private _value_pre_conversion_serialized: Number3 = [0, 0, 0];
	r!: FloatParam;
	g!: FloatParam;
	b!: FloatParam;
	static type() {
		return ParamType.COLOR;
	}
	componentNames(): Readonly<string[]> {
		return COMPONENT_NAMES_COLOR;
	}
	defaultValueSerialized() {
		if (CoreType.isArray(this.default_value)) {
			return this.default_value;
		} else {
			return this.default_value.toArray() as Number3;
		}
	}
	// rawInputSerialized() {
	// 	if (this._raw_input instanceof Color) {
	// 		return this._raw_input.toArray() as Number3;
	// 	} else {
	// 		const new_array: StringOrNumber3 = [this._raw_input[0], this._raw_input[1], this._raw_input[2]];
	// 		return new_array;
	// 	}
	// }
	valueSerialized() {
		this._update_value_serialized_if_required();
		return this._value_serialized;
	}
	valuePreConversionSerialized() {
		this._update_value_serialized_if_required();
		return this._value_pre_conversion_serialized;
	}
	private _copied_value: Number3 = [0, 0, 0];
	protected _copy_value(param: ColorParam) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}
	// protected _prefilter_invalid_raw_input(
	// 	raw_input: ParamInitValuesTypeMap[ParamType.COLOR]
	// ): ParamInitValuesTypeMap[ParamType.COLOR] {
	// 	return raw_input;
	// }
	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.COLOR]) {
		if (raw_input instanceof Color) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber3 = [raw_input[0], raw_input[1], raw_input[2]];
			return new_array;
		}
	}
	static are_raw_input_equal(
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
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.COLOR], val2: ParamValuesTypeMap[ParamType.COLOR]) {
		return val1.equals(val2);
	}
	initComponents() {
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

	set_value_from_components() {
		this._value_pre_conversion.r = this.r.value;
		this._value_pre_conversion.g = this.g.value;
		this._value_pre_conversion.b = this.b.value;

		this._value.copy(this._value_pre_conversion);

		const conversion = this.options.color_conversion();
		if (conversion != null && conversion != ColorConversion.NONE) {
			switch (conversion) {
				case ColorConversion.GAMMA_TO_LINEAR: {
					this._value.convertGammaToLinear();
					return;
				}
				case ColorConversion.LINEAR_TO_GAMMA: {
					this._value.convertLinearToGamma();
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
