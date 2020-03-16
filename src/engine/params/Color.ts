import {TypedMultipleParam} from './_Multiple';
import lodash_isArray from 'lodash/isArray';
// import lodash_isNumber from 'lodash/isNumber';
import {Color} from 'three/src/math/Color';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';

// import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';

const COMPONENT_NAMES_COLOR = ['r', 'g', 'b'];
export class ColorParam extends TypedMultipleParam<ParamType.COLOR> {
	protected _value = new Color();
	r!: FloatParam;
	g!: FloatParam;
	b!: FloatParam;
	static type() {
		return ParamType.COLOR;
	}
	static get component_names() {
		return COMPONENT_NAMES_COLOR;
	}
	get default_value_serialized() {
		if (lodash_isArray(this.default_value)) {
			return this.default_value;
		} else {
			return this.default_value.toArray() as Number3;
		}
	}
	// get raw_input_serialized() {
	// 	if (this._raw_input instanceof Color) {
	// 		return this._raw_input.toArray() as Number3;
	// 	} else {
	// 		const new_array: StringOrNumber3 = [this._raw_input[0], this._raw_input[1], this._raw_input[2]];
	// 		return new_array;
	// 	}
	// }
	get value_serialized() {
		return this.value.toArray() as Number3;
	}
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
	init_components() {
		super.init_components();
		this.r = this.components[0];
		this.g = this.components[1];
		this.b = this.components[2];
	}
	// set_raw_input_from_components() {
	// 	if (this._raw_input instanceof Color) {
	// 		if (
	// 			lodash_isNumber(this.r.raw_input) &&
	// 			lodash_isNumber(this.g.raw_input) &&
	// 			lodash_isNumber(this.b.raw_input)
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
	set_value_from_components() {
		this._value.r = this.r.value;
		this._value.g = this.g.value;
		this._value.b = this.b.value;
	}
	// convert(input: ParamInitValuesTypeMap[ParamType.COLOR]): Color | null {
	// 	if (lodash_isArray(input)) {
	// 		if(input.length == 3){
	// 			if( input.filter(lodash_isNumber).length > 0 ){
	// 				return new Color().fromArray(input);
	// 			}
	// 			if(first){
	// 				if(lodash_isNumber(first)){
	// 					return new Color().fromArray(input);
	// 				}
	// 			}
	// 		}
	// 	}
	// 	return new Color();
	// }
}
