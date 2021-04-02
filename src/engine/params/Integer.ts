import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {CoreString} from '../../core/String';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {CoreType} from '../../core/Type';

export class IntegerParam extends TypedNumericParam<ParamType.INTEGER> {
	static type() {
		return ParamType.INTEGER;
	}
	defaultValueSerialized() {
		return this._default_value;
	}
	rawInputSerialized() {
		return this._raw_input;
	}
	valueSerialized() {
		return this.value;
	}
	protected _copy_value(param: IntegerParam) {
		this.set(param.valueSerialized());
	}
	protected _prefilter_invalid_raw_input(raw_input: any): ParamInitValuesTypeMap[ParamType.INTEGER] {
		if (CoreType.isArray(raw_input)) {
			return raw_input[0] as ParamInitValuesTypeMap[ParamType.INTEGER];
		}
		if (CoreType.isString(raw_input) && CoreString.isNumber(raw_input)) {
			return parseInt(raw_input);
		}
		return raw_input;
	}

	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.INTEGER],
		raw_input2: ParamInitValuesTypeMap[ParamType.INTEGER]
	) {
		return raw_input1 == raw_input2;
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.INTEGER], val2: ParamValuesTypeMap[ParamType.INTEGER]) {
		return val1 == val2;
	}
	static convert(raw_val: ParamInitValuesTypeMap[ParamType.INTEGER]): number | null {
		if (CoreType.isNumber(raw_val)) {
			return Math.round(raw_val);
		} else {
			if (CoreType.isBoolean(raw_val)) {
				return raw_val ? 1 : 0;
			} else {
				if (CoreString.isNumber(raw_val)) {
					const parsed = parseInt(raw_val);
					if (CoreType.isNumber(parsed)) {
						return parsed;
					}
				}
			}
			return null;
		}
	}
	convert(raw_val: ParamInitValuesTypeMap[ParamType.INTEGER]): number | null {
		const result = IntegerParam.convert(raw_val);
		if (result) {
			return this.options.ensureInRange(result);
		} else {
			return result;
		}
	}
}
