import {TypedMultipleParam} from './_Multiple';

// import {ParamFloat} from './Float'
import {Vector4} from 'three/src/math/Vector4';
import {ParamType} from '../poly/ParamType';

const COMPONENT_NAMES_VECTOR4 = ['x', 'y', 'z', 'w'];
export class Vector4Param extends TypedMultipleParam<Vector4> {
	static type() {
		return ParamType.VECTOR4;
	}
	static component_names() {
		return COMPONENT_NAMES_VECTOR4;
	}

	async eval() {
		const cs = await this.eval_components();
		this._value.x = cs[0];
		this._value.y = cs[1];
		this._value.z = cs[2];
		this._value.w = cs[3];
		return this._value;
	}
}
