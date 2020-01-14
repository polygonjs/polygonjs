import {TypedMultipleParam} from './_Multiple';
import lodash_isArray from 'lodash/isArray';
import {Color} from 'three/src/math/Color';
import {ParamType} from '../poly/ParamType';

const COMPONENT_NAMES_COLOR = ['r', 'g', 'b'];
export class ColorParam extends TypedMultipleParam<ParamType.COLOR> {
	static type() {
		return ParamType.COLOR;
	}
	static get component_names() {
		return COMPONENT_NAMES_COLOR;
	}

	async eval() {
		const cs = await this.eval_components();
		this._value.r = cs[0];
		this._value.g = cs[1];
		this._value.b = cs[2];
		return this._value;
	}
	convert(input: any) {
		if (lodash_isArray(input)) {
			return new Color().fromArray(input);
		}
		return new Color();
	}
}
