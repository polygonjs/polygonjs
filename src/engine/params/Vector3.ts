import {TypedMultipleParam} from './_Multiple';
import lodash_isArray from 'lodash/isArray';
// import {ParamFloat} from './Float'
import {Vector3} from 'three/src/math/Vector3';
import {ParamType} from '../poly/ParamType';

const COMPONENT_NAMES_VECTOR3 = ['x', 'y', 'z'];
export class Vector3Param extends TypedMultipleParam<ParamType.VECTOR3> {
	static type() {
		return ParamType.VECTOR3;
	}
	static get component_names() {
		return COMPONENT_NAMES_VECTOR3;
	}

	async eval(target: Vector3) {
		const cs = await this.eval_components();
		if (target) {
			target.fromArray(cs);
		} else {
			this._value.x = cs[0];
			this._value.y = cs[1];
			this._value.z = cs[2];
			console.log('cs', cs);
			return this._value;
		}
	}
	convert(input: any) {
		if (lodash_isArray(input)) {
			return new Vector3().fromArray(input);
		}
		return new Vector3();
	}
}
