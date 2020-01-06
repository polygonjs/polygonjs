import {TypedMultipleParam} from './_Multiple'

// import {ParamFloat} from './Float'
import {Vector2} from 'three/src/math/Vector2'

const COMPONENT_NAMES_VECTOR2 = ['x', 'y']
export class Vector2Param extends TypedMultipleParam<Vector2> {
	static type() {
		return ParamType.VECTOR2
	}

	static component_names() {
		return COMPONENT_NAMES_VECTOR2
	}

	async eval() {
		const cs = await this.eval_components()
		this._value.x = cs[0]
		this._value.y = cs[1]
		return this._value
	}
}
