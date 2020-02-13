import {TypedMultipleParam} from './_Multiple';
import lodash_isArray from 'lodash/isArray';
import {FloatParam} from './Float';
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../poly/ParamType';
import {ParamValuesTypeMap} from './types/ParamValuesTypeMap';
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
	get value_serialized() {
		return this.value.toArray() as Number3;
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
