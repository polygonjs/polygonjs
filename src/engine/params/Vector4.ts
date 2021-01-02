import {Number4, StringOrNumber4} from '../../types/GlobalTypes';
import {TypedMultipleParam} from './_Multiple';
import {Vector4} from 'three/src/math/Vector4';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import {CoreType} from '../../core/Type';

const COMPONENT_NAMES_VECTOR4: Readonly<string[]> = ['x', 'y', 'z', 'w'];
export class Vector4Param extends TypedMultipleParam<ParamType.VECTOR4> {
	protected _value = new Vector4();
	x!: FloatParam;
	y!: FloatParam;
	z!: FloatParam;
	w!: FloatParam;
	static type() {
		return ParamType.VECTOR4;
	}
	get component_names(): Readonly<string[]> {
		return COMPONENT_NAMES_VECTOR4;
	}
	get default_value_serialized() {
		if (CoreType.isArray(this.default_value)) {
			return this.default_value;
		} else {
			return this.default_value.toArray() as Number4;
		}
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
	get value_serialized() {
		return this.value.toArray() as Number4;
	}
	private _copied_value: Number4 = [0, 0, 0, 0];
	protected _copy_value(param: Vector4Param) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}
	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR4]) {
		if (raw_input instanceof Vector4) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber4 = [raw_input[0], raw_input[1], raw_input[2], raw_input[3]];
			return new_array;
		}
	}
	static are_raw_input_equal(
		raw_input1: ParamInitValuesTypeMap[ParamType.VECTOR4],
		raw_input2: ParamInitValuesTypeMap[ParamType.VECTOR4]
	) {
		if (raw_input1 instanceof Vector4) {
			if (raw_input2 instanceof Vector4) {
				return raw_input1.equals(raw_input2);
			} else {
				return (
					raw_input1.x == raw_input2[0] &&
					raw_input1.y == raw_input2[1] &&
					raw_input1.z == raw_input2[2] &&
					raw_input1.w == raw_input2[3]
				);
			}
		} else {
			if (raw_input2 instanceof Vector4) {
				return (
					raw_input1[0] == raw_input2.x &&
					raw_input1[1] == raw_input2.y &&
					raw_input1[2] == raw_input2.z &&
					raw_input1[3] == raw_input2.w
				);
			} else {
				return (
					raw_input1[0] == raw_input2[0] &&
					raw_input1[1] == raw_input2[1] &&
					raw_input1[2] == raw_input2[2] &&
					raw_input1[3] == raw_input2[3]
				);
			}
		}
	}
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.VECTOR4], val2: ParamValuesTypeMap[ParamType.VECTOR4]) {
		return val1.equals(val2);
	}
	init_components() {
		super.init_components();
		this.x = this.components[0];
		this.y = this.components[1];
		this.z = this.components[2];
		this.w = this.components[3];
	}

	set_value_from_components() {
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
