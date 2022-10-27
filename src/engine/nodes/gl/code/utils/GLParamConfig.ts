import {Vector4} from 'three';
import {Vector3} from 'three';
import {Vector2} from 'three';
import {Color} from 'three';
import {ParamType} from '../../../../poly/ParamType';
import {ParamInitValuesTypeMap} from '../../../../params/types/ParamInitValuesTypeMap';
import {BaseNodeType} from '../../../_Base';
import {BaseParamType} from '../../../../params/_Base';
import {TypeAssert} from '../../../../poly/Assert';
import {IUniform} from 'three';
import {RampParam} from '../../../../params/Ramp';
// import {OperatorPathParam} from '../../../../params/OperatorPath';
import {BaseParamConfig} from '../../../utils/code/configs/BaseParamConfig';
import {NodePathParam} from '../../../../params/NodePath';
import {NodeContext} from '../../../../poly/NodeContext';

export interface GlParamConfigJSON<T extends ParamType> {
	type: T;
	name: string;
	defaultValue: ParamInitValuesTypeMap[T];
	uniformName: string;
}
export class GlParamConfig<T extends ParamType> extends BaseParamConfig<T> {
	private _uniform: IUniform | undefined;

	constructor(_type: T, _name: string, _defaultValue: ParamInitValuesTypeMap[T], private _uniformName: string) {
		super(_type, _name, _defaultValue);
	}

	toJSON(): GlParamConfigJSON<T> {
		return {
			type: this._type,
			name: this._name,
			defaultValue: this._defaultValue,
			uniformName: this._uniformName,
		};
	}
	static fromJSON(json: GlParamConfigJSON<ParamType>): GlParamConfig<ParamType> {
		return new GlParamConfig(json.type, json.name, json.defaultValue, json.uniformName);
	}

	uniformName() {
		return this._uniformName;
	}

	uniform() {
		return (this._uniform = this._uniform || this._createUniform());
	}

	private _createUniform() {
		return GlParamConfig.uniformByType(this._type);
	}

	protected override _callback(node: BaseNodeType, param: BaseParamType) {
		GlParamConfig.callback(param, this.uniform());
		// switch (param.type) {
		// 	case ParamType.RAMP:
		// 		this.uniform.value = (param as RampParam).rampTexture();
		// 		return;
		// 	case ParamType.OPERATOR_PATH:
		// 		GlParamConfig.set_uniform_value_from_texture(param as OperatorPathParam, this.uniform);
		// 		return;
		// 	default:
		// 		this.uniform.value = param.value;
		// }
	}

	static callback(param: BaseParamType, uniform: IUniform) {
		switch (param.type()) {
			case ParamType.RAMP:
				uniform.value = (param as RampParam).rampTexture();
				return;
			// case ParamType.OPERATOR_PATH:
			// 	GlParamConfig.set_uniform_value_from_texture(param as OperatorPathParam, uniform);
			// 	return;
			case ParamType.NODE_PATH:
				GlParamConfig.setUniformValueFromTextureFromNodePathParam(param as NodePathParam, uniform);
				return;
			default:
				uniform.value = param.value;
		}
	}

	// TODO: refactor that to use the default values map?
	static uniformByType(type: ParamType): IUniform {
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
			// case ParamType.OPERATOR_PATH:
			// 	return {value: 0};
			case ParamType.NODE_PATH:
				return {value: 0};
			case ParamType.PARAM_PATH:
				return {value: 0};
			// case ParamType.STRING: return {type: 't', value: null} // new Texture()}
			case ParamType.RAMP:
				return {value: null}; // new Texture()}
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

	// private static set_uniform_value_from_texture(param: OperatorPathParam, uniform: IUniform) {
	// 	const found_node = param.found_node();
	// 	if (found_node) {
	// 		if (found_node.isDirty()) {
	// 			found_node.compute().then((container) => {
	// 				const texture = container.texture();
	// 				uniform.value = texture;
	// 			});
	// 		} else {
	// 			const container = found_node.containerController.container();
	// 			const texture = container.texture();
	// 			uniform.value = texture;
	// 		}
	// 	} else {
	// 		uniform.value = null;
	// 	}
	// }
	private static async setUniformValueFromTextureFromNodePathParam(param: NodePathParam, uniform: IUniform) {
		if (param.isDirty()) {
			await param.compute();
		}
		const node = param.value.nodeWithContext(NodeContext.COP);
		if (node) {
			if (node.isDirty()) {
				await node.compute();
			}
			const container = node.containerController.container();
			const texture = container.texture();
			uniform.value = texture;
		} else {
			uniform.value = null;
		}
	}
}
