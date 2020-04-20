// import lodash_isArray from 'lodash/isArray'
// import lodash_isString from 'lodash/isString'
import lodash_isBoolean from 'lodash/isBoolean';
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
			if (lodash_isBoolean(raw_val)) {
				return raw_val ? 1 : 0;
			} else {
				if (CoreString.is_number(raw_val)) {
					const parsed = parseFloat(raw_val);
					if (lodash_isNumber(parsed)) {
						return parsed;
					}
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
}
