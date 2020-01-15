import lodash_isNumber from 'lodash/isNumber';
import lodash_isBoolean from 'lodash/isBoolean';
// import lodash_includes from 'lodash/includes'
import lodash_isString from 'lodash/isString';
import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';

export class BooleanParam extends TypedNumericParam<ParamType.BOOLEAN> {
	static type() {
		return ParamType.BOOLEAN;
	}
	convert(raw_val: ParamInitValuesTypeMap[ParamType.BOOLEAN]): boolean | null {
		if (lodash_isBoolean(raw_val)) {
			return raw_val;
		} else {
			if (lodash_isNumber(raw_val)) {
				return raw_val >= 1;
			} else {
				if (lodash_isString(raw_val)) {
					const parsed = parseFloat(raw_val);
					return parsed >= 1;
				}
			}
			return null;
		}
	}
	// convert_value(v: ParamInputValue): boolean {
	// 	return this.value_to_boolean(v)
	// }
	// convert_default_value(v: ParamInputValue): number {
	// 	if (lodash_isString(v)) {
	// 		return v
	// 	} else {
	// 		return this.value_to_boolean(v) // ? 1 : 0
	// 	}
	// }
	// is_value_expression(v: ParamInputValue): boolean {
	// 	return !lodash_includes([true, false, 0, 1, '0', '1'], v)
	// }

	// value_to_boolean(v: ParamInputValue): boolean {
	// 	if (lodash_isBoolean(v)) {
	// 		return v
	// 	} else {
	// 		if (lodash_isNumber(v)) {
	// 			return v > 0
	// 		} else {
	// 			return parseInt(v) > 0
	// 		}
	// 	}
	// }

	// eval(callback) {
	// 	return this.eval_raw((val) => {
	// 		const boolean_result = this.value_to_boolean(val)
	// 		return callback(boolean_result)
	// 	})
	// }
}
