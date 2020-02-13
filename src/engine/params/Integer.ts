import lodash_isNumber from 'lodash/isNumber';
// import lodash_isBoolean from 'lodash/isBoolean'

import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {CoreString} from 'src/core/String';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';

export class IntegerParam extends TypedNumericParam<ParamType.INTEGER> {
	static type() {
		return ParamType.INTEGER;
	}
	get default_value_serialized() {
		return this.default_value;
	}
	get value_serialized() {
		return this.value;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.INTEGER], val2: ParamValuesTypeMap[ParamType.INTEGER]) {
		return val1 == val2;
	}
	// convert_value(v: ParamInputValue): number {
	// 	const converted_val = lodash_isBoolean(v)
	// 		? v
	// 			? 1
	// 			: 0
	// 		: lodash_isNumber(v)
	// 		? Math.round(v)
	// 		: Math.round(parseFloat(v))

	// 	return this._ensure_in_range(converted_val)
	// }

	// is_value_expression(v: number | string) {
	// 	//!lodash_isNumber(v)
	// 	// I was using parseInt before
	// 	// but that means that doing param.set(2.9) would set it to 2
	// 	return `${v}` !== `${Math.round(parseFloat(v))}`
	// }
	static convert(raw_val: ParamInitValuesTypeMap[ParamType.INTEGER]): number | null {
		if (lodash_isNumber(raw_val)) {
			return Math.round(raw_val);
		} else {
			if (CoreString.is_number(raw_val)) {
				const parsed = parseInt(raw_val);
				if (lodash_isNumber(parsed)) {
					return parsed;
				}
			}
			return null;
		}
	}
	convert(raw_val: ParamInitValuesTypeMap[ParamType.INTEGER]): number | null {
		return IntegerParam.convert(raw_val);
	}
}
