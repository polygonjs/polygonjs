import {TypedMultipleParam} from './_Multiple';
import {Number2, StringOrNumber2} from '../../types/GlobalTypes';
import {Vector2} from 'three';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {CoreType} from '../../core/Type';

const COMPONENT_NAMES_VECTOR2: Readonly<string[]> = ['x', 'y'];
const tmp: Number2 = [0, 0];
export class Vector2Param extends TypedMultipleParam<ParamType.VECTOR2> {
	protected override _value = new Vector2();
	x!: FloatParam;
	y!: FloatParam;
	static override type() {
		return ParamType.VECTOR2;
	}

	override componentNames(): Readonly<string[]> {
		return COMPONENT_NAMES_VECTOR2;
	}
	override defaultValueSerialized() {
		if (CoreType.isArray(this._default_value)) {
			return this._default_value;
		} else {
			return this._default_value.toArray() as Number2;
		}
	}
	override _prefilterInvalidRawInput(rawInput: any) {
		if (rawInput instanceof Vector2) {
			rawInput.toArray(tmp);
			return tmp;
		}
		return super._prefilterInvalidRawInput(rawInput);
	}
	// get raw_input_serialized() {
	// 	if (this._raw_input instanceof Vector2) {
	// 		return this._raw_input.toArray() as Number2;
	// 	} else {
	// 		const new_array: StringOrNumber2 = [this._raw_input[0], this._raw_input[1]];
	// 		return new_array;
	// 	}
	// }
	override valueSerialized() {
		return this.value.toArray() as Number2;
	}
	private _copied_value: Number2 = [0, 0];
	protected override _copyValue(param: Vector2Param) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}

	protected override _cloneRawInput(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR2]) {
		if (raw_input instanceof Vector2) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber2 = [raw_input[0], raw_input[1]];
			// in case array elements are undefined
			if (new_array[0] == null) {
				new_array[0] = new_array[0] || 0;
			}
			if (new_array[1] == null) {
				new_array[1] = new_array[1] || new_array[0];
			}
			return new_array;
		}
	}
	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR2],
		raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR2]
	) {
		if (raw_input1 instanceof Vector2) {
			if (raw_input2 instanceof Vector2) {
				return raw_input1.equals(raw_input2);
			} else {
				return raw_input1.x == raw_input2[0] && raw_input1.y == raw_input2[1];
			}
		} else {
			if (raw_input2 instanceof Vector2) {
				return raw_input1[0] == raw_input2.x && raw_input1[1] == raw_input2.y;
			} else {
				return raw_input1[0] == raw_input2[0] && raw_input1[1] == raw_input2[1];
			}
		}
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.VECTOR2],
		val2: ParamValuesTypeMap[ParamType.VECTOR2]
	) {
		return val1.equals(val2);
	}
	override initComponents() {
		super.initComponents();
		this.x = this.components[0];
		this.y = this.components[1];
	}

	override setValueFromComponents() {
		this._value.x = this.x.value;
		this._value.y = this.y.value;
	}
	// convert(input: any) {
	// 	if (CoreType.isArray(input)) {
	// 		return new Vector2().fromArray(input);
	// 	}
	// 	return new Vector2();
	// }
}
