import {Number3, StringOrNumber3} from '../../types/GlobalTypes';
import {TypedMultipleParam} from './_Multiple';
import {FloatParam} from './Float';
import {Vector3} from 'three';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {CoreType} from '../../core/Type';

const COMPONENT_NAMES_VECTOR3: Readonly<string[]> = ['x', 'y', 'z'];
const tmp: Number3 = [0, 0, 0];

function vector3EqualsStringNumber3(v: Vector3, array: StringOrNumber3): boolean {
	return v.x == array[0] && v.y == array[1] && v.z == array[2];
}
function stringNumber3Equals(array1: StringOrNumber3, array2: StringOrNumber3): boolean {
	return array1[0] == array2[0] && array1[1] == array2[1] && array1[2] == array2[2];
}

export class Vector3Param extends TypedMultipleParam<ParamType.VECTOR3> {
	protected override _value = new Vector3();
	x!: FloatParam;
	y!: FloatParam;
	z!: FloatParam;
	static override type() {
		return ParamType.VECTOR3;
	}
	override componentNames(): Readonly<string[]> {
		return COMPONENT_NAMES_VECTOR3;
	}
	override defaultValueSerialized() {
		if (CoreType.isArray(this._default_value)) {
			return this._default_value;
		} else {
			return this._default_value.toArray() as Number3;
		}
	}
	override _prefilterInvalidRawInput(rawInput: any) {
		if (rawInput instanceof Vector3) {
			rawInput.toArray(tmp);
			return tmp;
		}
		return super._prefilterInvalidRawInput(rawInput);
	}
	// get raw_input_serialized() {
	// 	if (this._raw_input instanceof Vector3) {
	// 		return this._raw_input.toArray() as Number3;
	// 	} else {
	// 		const new_array: StringOrNumber3 = [this._raw_input[0], this._raw_input[1], this._raw_input[2]];
	// 		return new_array;
	// 	}
	// }
	override valueSerialized() {
		return this.value.toArray() as Number3;
	}
	private _copied_value: Number3 = [0, 0, 0];
	protected override _copyValue(param: Vector3Param) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}

	protected override _cloneRawInput(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR3]) {
		if (raw_input instanceof Vector3) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber3 = [raw_input[0], raw_input[1], raw_input[2]];
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
			return new_array;
		}
	}

	static override areRawInputEqual(
		raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR3],
		raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR3]
	) {
		if (raw_input1 instanceof Vector3) {
			if (raw_input2 instanceof Vector3) {
				return raw_input1.equals(raw_input2);
			} else {
				return vector3EqualsStringNumber3(raw_input1, raw_input2);
			}
		} else {
			if (raw_input2 instanceof Vector3) {
				return vector3EqualsStringNumber3(raw_input2, raw_input1);
			} else {
				return stringNumber3Equals(raw_input1, raw_input2);
			}
		}
	}
	static override areValuesEqual(
		val1: ParamValuesTypeMap[ParamType.VECTOR3],
		val2: ParamValuesTypeMap[ParamType.VECTOR3]
	) {
		return val1.equals(val2);
	}
	override initComponents() {
		super.initComponents();
		this.x = this.components[0];
		this.y = this.components[1];
		this.z = this.components[2];
	}

	// set_raw_input_from_components() {
	// 	if (this._raw_input instanceof Vector3) {
	// 		if (
	// 			CoreType.isNumber(this.x.raw_input) &&
	// 			CoreType.isNumber(this.y.raw_input) &&
	// 			CoreType.isNumber(this.z.raw_input)
	// 		) {
	// 			this._raw_input.x = this.x.raw_input;
	// 			this._raw_input.y = this.y.raw_input;
	// 			this._raw_input.z = this.z.raw_input;
	// 		} else {
	// 			this._raw_input = [this.x.raw_input, this.y.raw_input, this.z.raw_input];
	// 		}
	// 	} else {
	// 		this._raw_input[0] = this.x.raw_input;
	// 		this._raw_input[1] = this.y.raw_input;
	// 		this._raw_input[2] = this.z.raw_input;
	// 	}
	// }
	override setValueFromComponents() {
		this._value.x = this.x.value;
		this._value.y = this.y.value;
		this._value.z = this.z.value;
	}
	// convert(input: ParamInitValuesTypeMap[ParamType.VECTOR3]) {
	// 	if (CoreType.isArray(input)) {
	// 		return new Vector3().fromArray(input);
	// 	}
	// 	return new Vector3();
	// }
}
