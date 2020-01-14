import {TypedMultipleParam} from './_Multiple';

import lodash_isArray from 'lodash/isArray';
import {Vector2} from 'three/src/math/Vector2';
import {ParamType} from '../poly/ParamType';

const COMPONENT_NAMES_VECTOR2 = ['x', 'y'];
export class Vector2Param extends TypedMultipleParam<ParamType.VECTOR2> {
	static type() {
		return ParamType.VECTOR2;
	}

	static get component_names() {
		return COMPONENT_NAMES_VECTOR2;
	}

	async eval() {
		const cs = await this.eval_components();
		this._value.x = cs[0];
		this._value.y = cs[1];
		return this._value;
	}
	convert(input: any) {
		if (lodash_isArray(input)) {
			return new Vector2().fromArray(input);
		}
		return new Vector2();
	}
}
