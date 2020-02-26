// import lodash_isArray from 'lodash/isArray'
// import lodash_isString from 'lodash/isString'
// import lodash_isBoolean from 'lodash/isBoolean';
import lodash_isNumber from 'lodash/isNumber';
import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {CoreString} from '../../core/String';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';

export class FloatParam extends TypedNumericParam<ParamType.FLOAT> {
	static type() {
		return ParamType.FLOAT;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	get raw_input_serialized() {
		return this._raw_input;
	}
	get value_serialized() {
		return this.value;
	}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.FLOAT],
		raw_input2: ParamInitValuesTypeMap[ParamType.FLOAT]
	) {
		return raw_input1 == raw_input2;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.FLOAT], val2: ParamValuesTypeMap[ParamType.FLOAT]) {
		return val1 == val2;
	}
	static convert(raw_val: ParamInitValuesTypeMap[ParamType.FLOAT]): number | null {
		if (lodash_isNumber(raw_val)) {
			return raw_val;
		} else {
			if (CoreString.is_number(raw_val)) {
				const parsed = parseFloat(raw_val);
				if (lodash_isNumber(parsed)) {
					return parsed;
				}
			}
			return null;
		}
	}
	convert(raw_val: ParamInitValuesTypeMap[ParamType.FLOAT]): number | null {
		const result = FloatParam.convert(raw_val);
		if (result) {
			return this.options.ensure_in_range(result);
		} else {
			return result;
		}
	}
	// convert_value(v) {
	// 	// if(lodash_isNumber(v)){
	// 	// 	//
	// 	// }
	// 	if (lodash_isBoolean(v)) {
	// 		v = v ? 1 : 0
	// 	}
	// 	if (lodash_isString(v)) {
	// 		v = parseFloat(v)
	// 	}
	// 	if (lodash_isArray(v)) {
	// 		v = v[0]
	// 	}
	// 	return this._ensure_in_range(v)
	// }
	// convert_default_value(v) {
	// 	// if(lodash_isNumber(v)){
	// 	// 	//
	// 	// }
	// 	if (lodash_isBoolean(v)) {
	// 		v = v ? 1 : 0
	// 	}
	// 	// if(lodash_isString(v)){
	// 	// 	v = parseFloat(v)
	// 	// }
	// 	if (lodash_isArray(v)) {
	// 		v = v[0]
	// 	}
	// 	return v
	// }

	// is_value_expression(v) {
	// 	//console.log("is_value_expression", this, v, !lodash_isNumber(v))
	// 	//!lodash_isNumber(v)
	// 	return `${v}` !== `${parseFloat(v)}`
	// }
}
