import {TypedMultipleParam} from './_Multiple';

import {Vector2} from 'three/src/math/Vector2';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
import {ParamInitValuesTypeMap} from './types/ParamInitValuesTypeMap';
import { CoreType } from '../../core/Type';

const COMPONENT_NAMES_VECTOR2: Readonly<string[]> = ['x', 'y'];
export class Vector2Param extends TypedMultipleParam<ParamType.VECTOR2> {
	protected _value = new Vector2();
	x!: FloatParam;
	y!: FloatParam;
	static type() {
		return ParamType.VECTOR2;
	}

	get component_names(): Readonly<string[]> {
		return COMPONENT_NAMES_VECTOR2;
	}
	get default_value_serialized() {
		if (CoreType.isArray(this.default_value)) {
			return this.default_value;
		} else {
			return this.default_value.toArray() as Number2;
		}
	}
	// get raw_input_serialized() {
	// 	if (this._raw_input instanceof Vector2) {
	// 		return this._raw_input.toArray() as Number2;
	// 	} else {
	// 		const new_array: StringOrNumber2 = [this._raw_input[0], this._raw_input[1]];
	// 		return new_array;
	// 	}
	// }
	get value_serialized() {
		return this.value.toArray() as Number2;
	}
	private _copied_value: Number2 = [0, 0];
	protected _copy_value(param: Vector2Param) {
		param.value.toArray(this._copied_value);
		this.set(this._copied_value);
	}

	protected _clone_raw_input(raw_input: ParamInitValuesTypeMap[ParamType.VECTOR2]) {
		if (raw_input instanceof Vector2) {
			return raw_input.clone();
		} else {
			const new_array: StringOrNumber2 = [raw_input[0], raw_input[1]];
			return new_array;
		}
	}
	static are_raw_input_equal(
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
	static are_values_equal(val1: ParamValuesTypeMap[ParamType.VECTOR2], val2: ParamValuesTypeMap[ParamType.VECTOR2]) {
		return val1.equals(val2);
	}
	init_components() {
		super.init_components();
		this.x = this.components[0];
		this.y = this.components[1];
	}

	set_value_from_components() {
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
