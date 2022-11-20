import {Number4, StringOrNumber4} from '../../types/GlobalTypes';
import {TypedMultipleParam} from './_Multiple';
import {Vector4} from 'three';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {CoreType} from '../../core/Type';

const COMPONENT_NAMES_VECTOR4: Readonly<string[]> = ['x', 'y', 'z', 'w'];
const tmp: Number4 = [0, 0, 0, 0];

function vector2EqualsStringNumber4(v: Vector4, array: StringOrNumber4): boolean {
	return v.x == array[0] && v.y == array[1] && v.z == array[2] && v.w == array[3];
}
function stringNumber4Equals(array1: StringOrNumber4, array2: StringOrNumber4): boolean {
	return array1[0] == array2[0] && array1[1] == array2[1] && array1[2] == array2[2] && array1[3] == array2[3];
}

export class Vector4Param extends TypedMultipleParam<ParamType.VECTOR4> {
	protected override _value = new Vector4();
	x!: FloatParam;
	y!: FloatParam;
	z!: FloatParam;
	w!: FloatParam;
	static override type() {
		return ParamType.VECTOR4;
	}
	override componentNames(): Readonly<string[]> {
		return COMPONENT_NAMES_VECTOR4;
	}
	override defaultValueSerialized() {
		if (CoreType.isArray(this._default_value)) {
			return this._default_value;
		} else {
			return this._default_value.toArray() as Number4;
		}
	}
	override _prefilterInvalidRawInput(rawInput: any) {
		if (rawInput instanceof Vector4) {
			rawInput.toArray(tmp);
			return tmp;
		}
		return super._prefilterInvalidRawInput(rawInput);
	}
	// get raw_input_serialized() {
	// 	if (this._raw_input instanceof Vector4) {
	// 		return this._raw_input.toArray() as Number4;
	// 	} else {
	// 		const new_array: StringOrNumber4 = [
	// 			this._raw_input[0],
	// 			this._raw_input[1],
	// 			this._raw_input[2],
	// 			this._raw_input[3],
	// 		];
	// 		return new_array;
	// 	}
	// }
	override valueSerialized() {
		return this.value.toArray() as Number4;
	}
	private _copied_value: Number4 = [0, 0, 0, 0];
	protected override _copyValue(param: Vector4Param) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}
	protected override _cloneRawInput(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR4]) {
		if (raw_input instanceof Vector4) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber4 = [raw_input[0], raw_input[1], raw_input[2], raw_input[3]];
			// in case array elements are undefined
			if (new_array[0] == null) {
				new_array[0] = new_array[0] || 0;
			}
			if (new_array[1] == null) {
				new_array[1] = new_array[1] || new_array[0];
			}
			if (new_array[2] == null) {
				new_array[2] = new_array[2] || new_array[1];
			}
			if (new_array[3] == null) {
				new_array[3] = new_array[3] || new_array[2];
			}
			return new_array;
		}
	}
	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR4],
		raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR4]
	) {
		if (raw_input1 instanceof Vector4) {
			if (raw_input2 instanceof Vector4) {
				return raw_input1.equals(raw_input2);
			} else {
				return vector2EqualsStringNumber4(raw_input1, raw_input2);
			}
		} else {
			if (raw_input2 instanceof Vector4) {
				return vector2EqualsStringNumber4(raw_input2, raw_input1);
			} else {
				return stringNumber4Equals(raw_input1, raw_input2);
			}
		}
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.VECTOR4],
		val2: ParamValuesTypeMap[ParamType.VECTOR4]
	) {
		return val1.equals(val2);
	}
	override initComponents() {
		super.initComponents();
		this.x = this.components[0];
		this.y = this.components[1];
		this.z = this.components[2];
		this.w = this.components[3];
	}

	override setValueFromComponents() {
		this._value.x = this.x.value;
		this._value.y = this.y.value;
		this._value.z = this.z.value;
		this._value.w = this.w.value;
	}
	// convert(input: any) {
	// 	if (CoreType.isArray(input)) {
	// 		return new Vector4().fromArray(input);
	// 	}
	// 	return new Vector4();
	// }
}
