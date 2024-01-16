import {TypedNumericParam} from './_Numeric';
import {ParamType} from '../poly/ParamType';
import {CoreString} from '../../core/String';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {isString,isBoolean,isNumber} from '../../core/Type';

export class BooleanParam extends TypedNumericParam<ParamType.BOOLEAN> {
	static override type() {
		return ParamType.BOOLEAN;
	}
	// TODO: be careful as this does not allow serialization of expressions as default value
	override defaultValueSerialized() {
		if (isString(this._default_value)) {
			return this._default_value;
		} else {
			return this.convert(this._default_value) || false;
		}
	}
	override rawInputSerialized() {
		return this._raw_input;
	}
	override valueSerialized() {
		return this.value;
	}
	protected override _copyValue(param: BooleanParam) {
		this.set(param.value);
	}
	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.BOOLEAN],
		raw_input2: ParamInitValuesTypeMap[ParamType.BOOLEAN]
	) {
		return raw_input1 == raw_input2;
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.BOOLEAN],
		val2: ParamValuesTypeMap[ParamType.BOOLEAN]
	) {
		return val1 == val2;
	}
	override convert(raw_val: ParamInitValuesTypeMap[ParamType.BOOLEAN]): boolean | null {
		if (isBoolean(raw_val)) {
			return raw_val;
		} else {
			if (isNumber(raw_val)) {
				return raw_val >= 1;
			} else {
				if (isString(raw_val)) {
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
}
