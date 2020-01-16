import {TypedMultipleParam} from './_Multiple';

// import lodash_isArray from 'lodash/isArray';
import {Vector4} from 'three/src/math/Vector4';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';

const COMPONENT_NAMES_VECTOR4 = ['x', 'y', 'z', 'w'];
export class Vector4Param extends TypedMultipleParam<ParamType.VECTOR4> {
	protected _value = new Vector4();
	x: FloatParam;
	y: FloatParam;
	z: FloatParam;
	w: FloatParam;
	static type() {
		return ParamType.VECTOR4;
	}
	static get component_names() {
		return COMPONENT_NAMES_VECTOR4;
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
	// 	if (lodash_isArray(input)) {
	// 		return new Vector4().fromArray(input);
	// 	}
	// 	return new Vector4();
	// }
}
