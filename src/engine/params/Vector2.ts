import {TypedMultipleParam} from './_Multiple';

// import lodash_isArray from 'lodash/isArray';
import {Vector2} from 'three/src/math/Vector2';
import {ParamType} from '../poly/ParamType';
import {FloatParam} from './Float';

const COMPONENT_NAMES_VECTOR2 = ['x', 'y'];
export class Vector2Param extends TypedMultipleParam<ParamType.VECTOR2> {
	protected _value = new Vector2();
	x: FloatParam;
	y: FloatParam;
	static type() {
		return ParamType.VECTOR2;
	}

	static get component_names() {
		return COMPONENT_NAMES_VECTOR2;
	}
	init_components() {
		super.init_components();
		this.x = this.components[0];
		this.y = this.components[1];
	}

	async compute() {
		await this.compute_components();
		this._value.x = this.x.value;
		this._value.y = this.y.value;
	}
	// convert(input: any) {
	// 	if (lodash_isArray(input)) {
	// 		return new Vector2().fromArray(input);
	// 	}
	// 	return new Vector2();
	// }
}
