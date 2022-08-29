import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {CoreString} from '../../core/String';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {CoreType} from '../../core/Type';

export class IntegerParam extends TypedNumericParam<ParamType.INTEGER> {
	static override type() {
		return ParamType.INTEGER;
	}
	override defaultValueSerialized() {
		return this._default_value;
	}
	override rawInputSerialized() {
		return this._raw_input;
	}
	override valueSerialized() {
		return this.value;
	}
	protected override _copyValue(param: IntegerParam) {
		this.set(param.valueSerialized());
	}
	protected override _prefilterInvalidRawInput(raw_input: any): ParamInitValuesTypeMap[ParamType.INTEGER] {
		if (CoreType.isArray(raw_input)) {
			return raw_input[0] as ParamInitValuesTypeMap[ParamType.INTEGER];
		}
		if (CoreType.isString(raw_input) && CoreString.isNumber(raw_input)) {
			// we check here that we have a string AND that the string can be converted to a valid number
			const num = parseInt(raw_input);
			if (num != null) {
				const converted = this.convert(num);
				if (converted != null) {
					return converted;
				}
			}
		}
		if (CoreType.isNumber(raw_input)) {
			const converted = this.convert(raw_input);
			if (converted != null) {
				return converted;
			}
		}
		return raw_input;
	}

	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.INTEGER],
		raw_input2: ParamInitValuesTypeMap[ParamType.INTEGER]
	) {
		return raw_input1 == raw_input2;
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.INTEGER],
		val2: ParamValuesTypeMap[ParamType.INTEGER]
	) {
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
	override convert(raw_val: ParamInitValuesTypeMap[ParamType.INTEGER]): number | null {
		const result = IntegerParam.convert(raw_val);
		if (result != null) {
			return this.options.ensureInRange(result);
		} else {
			return result;
		}
	}
}
