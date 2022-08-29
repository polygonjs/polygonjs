import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {CoreString} from '../../core/String';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {CoreType} from '../../core/Type';
export class FloatParam extends TypedNumericParam<ParamType.FLOAT> {
	static override type() {
		return ParamType.FLOAT;
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
	protected override _copyValue(param: FloatParam) {
		this.set(param.valueSerialized());
	}
	protected override _prefilterInvalidRawInput(raw_input: any): ParamInitValuesTypeMap[ParamType.INTEGER] {
		if (CoreType.isArray(raw_input)) {
			return raw_input[0] as ParamInitValuesTypeMap[ParamType.INTEGER];
		}
		if (CoreType.isString(raw_input) && CoreString.isNumber(raw_input)) {
			// we check here that we have a string AND that the string can be converted to a valid number
			const num = parseFloat(raw_input);
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
		raw_input1: ParamInitValuesTypeMap[ParamType.FLOAT],
		raw_input2: ParamInitValuesTypeMap[ParamType.FLOAT]
	) {
		return raw_input1 == raw_input2;
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.FLOAT],
		val2: ParamValuesTypeMap[ParamType.FLOAT]
	) {
		return val1 == val2;
	}
	static convert(raw_val: ParamInitValuesTypeMap[ParamType.FLOAT]): number | null {
		if (CoreType.isNumber(raw_val)) {
			return raw_val;
		} else {
			if (CoreType.isBoolean(raw_val)) {
				return raw_val ? 1 : 0;
			} else {
				if (CoreString.isNumber(raw_val)) {
					const parsed = parseFloat(raw_val);
					if (CoreType.isNumber(parsed)) {
						return parsed;
					}
				}
			}
			return null;
		}
	}
	override convert(raw_val: ParamInitValuesTypeMap[ParamType.FLOAT]): number | null {
		const result = FloatParam.convert(raw_val);
		if (result != null) {
			return this.options.ensureInRange(result);
		} else {
			return result;
		}
	}
}
