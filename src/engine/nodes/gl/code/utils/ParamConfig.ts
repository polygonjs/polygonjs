import {Vector4} from 'three/src/math/Vector4';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';
import {Color} from 'three/src/math/Color';
import {ParamType} from '../../../../poly/ParamType';
import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';
import {BaseNodeType} from '../../../_Base';
import {BaseParamType} from '../../../../params/_Base';
import {TypeAssert} from '../../../../poly/Assert';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
import {RampParam} from '../../../../params/Ramp';
import {OperatorPathParam} from '../../../../params/OperatorPath';
import {ParamConfig} from '../../../utils/code/configs/ParamConfig';

export class GlParamConfig<T extends ParamType> extends ParamConfig<T> {
	private _uniform: IUniform | undefined;

	constructor(_type: T, _name: string, _default_value: ParamInitValuesTypeMap[T], private _uniform_name: string) {
		super(_type, _name, _default_value);
	}

	get uniform_name() {
		return this._uniform_name;
	}

	get uniform() {
		return (this._uniform = this._uniform || this._create_uniform());
	}

	private _create_uniform() {
		return GlParamConfig.uniform_by_type(this._type);
	}

	execute_callback(node: BaseNodeType, param: BaseParamType) {
		this._callback(node, param);
	}

	protected _callback(node: BaseNodeType, param: BaseParamType) {
		GlParamConfig.callback(param, this.uniform);
		// switch (param.type) {
		// 	case ParamType.RAMP:
		// 		this.uniform.value = (param as RampParam).ramp_texture();
		// 		return;
		// 	case ParamType.OPERATOR_PATH:
		// 		GlParamConfig.set_uniform_value_from_texture(param as OperatorPathParam, this.uniform);
		// 		return;
		// 	default:
		// 		this.uniform.value = param.value;
		// }
	}

	static callback(param: BaseParamType, uniform: IUniform) {
		switch (param.type) {
			case ParamType.RAMP:
				uniform.value = (param as RampParam).ramp_texture();
				return;
			case ParamType.OPERATOR_PATH:
				GlParamConfig.set_uniform_value_from_texture(param as OperatorPathParam, uniform);
				return;
			default:
				uniform.value = param.value;
		}
	}

	// TODO: refactor that to use the default values map?
	static uniform_by_type(type: ParamType): IUniform {
		switch (type) {
			case ParamType.BOOLEAN:
				return {value: 0};
			case ParamType.BUTTON:
				return {value: 0};
			case ParamType.COLOR:
				return {value: new Color(0, 0, 0)};
			case ParamType.FLOAT:
				return {value: 0};
			case ParamType.FOLDER:
				return {value: 0};
			case ParamType.INTEGER:
				return {value: 0};
			case ParamType.OPERATOR_PATH:
				return {value: 0};
			// case ParamType.STRING: return {type: 't', value: null} // new Texture()}
			case ParamType.RAMP:
				return {value: null}; // new Texture()}
			case ParamType.SEPARATOR:
				return {value: 0};
			case ParamType.STRING:
				return {value: null};
			case ParamType.VECTOR2:
				return {value: new Vector2(0, 0)};
			case ParamType.VECTOR3:
				return {value: new Vector3(0, 0, 0)};
			case ParamType.VECTOR4:
				return {value: new Vector4(0, 0, 0, 0)};
		}
		TypeAssert.unreachable(type);
	}

	static set_uniform_value_from_texture(param: OperatorPathParam, uniform: IUniform) {
		const found_node = param.found_node();
		if (found_node) {
			if (found_node.is_dirty) {
				found_node.request_container().then((container) => {
					const texture = container.texture();
					uniform.value = texture;
				});
			} else {
				const container = found_node.container_controller.container;
				const texture = container.texture();
				uniform.value = texture;
			}
		} else {
			uniform.value = null;
		}
	}

	set_uniform_value_from_ramp(param: RampParam, uniform: IUniform) {
		uniform.value = param.ramp_texture();
	}
}
