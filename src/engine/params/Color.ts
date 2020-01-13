import {TypedMultipleParam} from './_Multiple';
// import {ParamFloat} from './Float'
import {Color} from 'three/src/math/Color';
import {ParamType} from '../poly/ParamType';

const COMPONENT_NAMES_COLOR = ['r', 'g', 'b'];
export class ColorParam extends TypedMultipleParam<Color> {
	static type() {
		return ParamType.COLOR;
	}
	static component_names() {
		return COMPONENT_NAMES_COLOR;
	}

	async eval() {
		const cs = await this.eval_components();
		this._value.r = cs[0];
		this._value.g = cs[1];
		this._value.b = cs[2];
		return this._value;
	}
}
