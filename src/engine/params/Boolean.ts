import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {CoreString} from '../../core/String';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {CoreType} from '../../core/Type';

export class BooleanParam extends TypedNumericParam<ParamType.BOOLEAN> {
	static type() {
		return ParamType.BOOLEAN;
	}
	// TODO: be careful as this does not allow serialization of expressions as default value
	get default_value_serialized() {
		if (CoreType.isString(this.default_value)) {
			return this.default_value;
		} else {
			return this.convert(this.default_value) || false;
		}
	}
	get raw_input_serialized() {
		return this._raw_input;
	}
	get value_serialized() {
		return this.value;
	}
	protected _copy_value(param: BooleanParam) {
		this.set(param.value);
	}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.BOOLEAN],
		raw_input2: ParamInitValuesTypeMap[ParamType.BOOLEAN]
	) {
		return raw_input1 == raw_input2;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.BOOLEAN], val2: ParamValuesTypeMap[ParamType.BOOLEAN]) {
		return val1 == val2;
	}
	convert(raw_val: ParamInitValuesTypeMap[ParamType.BOOLEAN]): boolean | null {
		if (CoreType.isBoolean(raw_val)) {
			return raw_val;
		} else {
			if (CoreType.isNumber(raw_val)) {
				return raw_val >= 1;
			} else {
				if (CoreType.isString(raw_val)) {
					if (CoreString.isBoolean(raw_val)) {
						return CoreString.toBoolean(raw_val);
					} else {
						if (CoreString.isNumber(raw_val)) {
							const parsed = parseFloat(raw_val);
							return parsed >= 1;
						}
					}
				}
			}
		}
		return null;
	}
	// convert_value(v: ParamInputValue): boolean {
	// 	return this.value_to_boolean(v)
	// }
	// convert_default_value(v: ParamInputValue): number {
	// 	if (CoreType.isString(v)) {
	// 		return v
	// 	} else {
	// 		return this.value_to_boolean(v) // ? 1 : 0
	// 	}
	// }
	// is_value_expression(v: ParamInputValue): boolean {
	// 	return !lodash_includes([true, false, 0, 1, '0', '1'], v)
	// }

	// value_to_boolean(v: ParamInputValue): boolean {
	// 	if (CoreType.isBoolean(v)) {
	// 		return v
	// 	} else {
	// 		if (CoreType.isNumber(v)) {
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
