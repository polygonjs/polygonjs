import {TypedMultipleParam} from './_Multiple';
import {FloatParam} from './Float';
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import { CoreType } from '../../core/Type';

const COMPONENT_NAMES_VECTOR3: Readonly<string[]> = ['x', 'y', 'z'];
export class Vector3Param extends TypedMultipleParam<ParamType.VECTOR3> {
	protected _value = new Vector3();
	x!: FloatParam;
	y!: FloatParam;
	z!: FloatParam;
	static type() {
		return ParamType.VECTOR3;
	}
	get component_names(): Readonly<string[]> {
		return COMPONENT_NAMES_VECTOR3;
	}
	get default_value_serialized() {
		if (CoreType.isArray(this.default_value)) {
			return this.default_value;
		} else {
			return this.default_value.toArray() as Number3;
		}
	}
	// get raw_input_serialized() {
	// 	if (this._raw_input instanceof Vector3) {
	// 		return this._raw_input.toArray() as Number3;
	// 	} else {
	// 		const new_array: StringOrNumber3 = [this._raw_input[0], this._raw_input[1], this._raw_input[2]];
	// 		return new_array;
	// 	}
	// }
	get value_serialized() {
		return this.value.toArray() as Number3;
	}
	private _copied_value: Number3 = [0, 0, 0];
	protected _copy_value(param: Vector3Param) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}

	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR3]) {
		if (raw_input instanceof Vector3) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber3 = [raw_input[0], raw_input[1], raw_input[2]];
			return new_array;
		}
	}

	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR3],
		raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR3]
	) {
		if (raw_input1 instanceof Vector3) {
			if (raw_input2 instanceof Vector3) {
				return raw_input1.equals(raw_input2);
			} else {
				return raw_input1.x == raw_input2[0] && raw_input1.y == raw_input2[1] && raw_input1.z == raw_input2[2];
			}
		} else {
			if (raw_input2 instanceof Vector3) {
				return raw_input1[0] == raw_input2.x && raw_input1[1] == raw_input2.y && raw_input1[2] == raw_input2.z;
			} else {
				return (
					raw_input1[0] == raw_input2[0] && raw_input1[1] == raw_input2[1] && raw_input1[2] == raw_input2[2]
				);
			}
		}
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.VECTOR3], val2: ParamValuesTypeMap[ParamType.VECTOR3]) {
		return val1.equals(val2);
	}
	init_components() {
		super.init_components();
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
	set_value_from_components() {
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
