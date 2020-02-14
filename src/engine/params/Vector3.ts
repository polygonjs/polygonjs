import {TypedMultipleParam} from './_Multiple';
import lodash_isArray from 'lodash/isArray';
import {FloatParam} from './Float';
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
// import {ParamInitValuesTypeMap} from '../nodes/utils/params/ParamsController';

const COMPONENT_NAMES_VECTOR3 = ['x', 'y', 'z'];
export class Vector3Param extends TypedMultipleParam<ParamType.VECTOR3> {
	protected _value = new Vector3();
	x!: FloatParam;
	y!: FloatParam;
	z!: FloatParam;
	static type() {
		return ParamType.VECTOR3;
	}
	static get component_names() {
		return COMPONENT_NAMES_VECTOR3;
	}
	get default_value_serialized() {
		if (lodash_isArray(this.default_value)) {
			return this.default_value;
		} else {
			return this.default_value.toArray() as Number3;
		}
	}
	get raw_input_serialized() {
		if (this._raw_input instanceof Vector3) {
			return this._raw_input.toArray() as Number3;
		} else {
			const new_array: StringOrNumber3 = [this._raw_input[0], this._raw_input[1], this._raw_input[2]];
			return new_array;
		}
	}
	get value_serialized() {
		return this.value.toArray() as Number3;
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

	set_value_from_components() {
		this._value.x = this.x.value;
		this._value.y = this.y.value;
		this._value.z = this.z.value;
	}
	// convert(input: ParamInitValuesTypeMap[ParamType.VECTOR3]) {
	// 	if (lodash_isArray(input)) {
	// 		return new Vector3().fromArray(input);
	// 	}
	// 	return new Vector3();
	// }
}
