import {VideoTexture} from 'three/src/textures/VideoTexture';
import {Vector4} from 'three/src/math/Vector4';
import {Vector3} from 'three/src/math/Vector3';
import {Vector2} from 'three/src/math/Vector2';

import {ParamType} from 'src/engine/poly/ParamType';
import {ParamInitValuesTypeMap} from 'src/engine/params/types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from 'src/engine/params/types/ParamValuesTypeMap';
import {ParamConstructorByType} from 'src/engine/params/types/ParamConstructorByType';

import {BaseNodeType} from 'src/engine/nodes/_Base';
import {TypedParam} from 'src/engine/params/_Base';
import {NodeContext} from 'src/engine/poly/NodeContext';
import {TypeAssert} from 'src/engine/poly/Assert';
import {IUniform} from 'three/src/renderers/shaders/UniformsLib';
// import { RampValue } from 'src/engine/params/ramp/RampValue';
import {RampParam} from 'src/engine/params/Ramp';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';
// import {ParamValueComparer} from 'src/engine/nodes/utils/params/ParamValueComparer';
// import {ParamValueCloner} from 'src/engine/nodes/utils/params/ParamValueCloner';
// import {CoreTextureLoader} from 'src/Core/Loader/Texture'

export class ParamConfig<T extends ParamType> {
	private _uniform: IUniform | undefined;
	private _cached_param_value: ParamValuesTypeMap[T] | undefined;
	// private _texture_loader: CoreTextureLoader

	constructor(
		private _type: T,
		private _name: string,
		private _default_value: ParamInitValuesTypeMap[T],
		private _uniform_name: string
	) {}

	static from_param<K extends ParamType>(param: TypedParam<K>, uniform_name: string): ParamConfig<K> {
		return new ParamConfig<K>(param.type, param.name, param.default_value, uniform_name);
	}

	get type() {
		return this._type;
	}
	get name() {
		return this._name;
	}
	get default_value() {
		return this._default_value;
	}
	get uniform_name() {
		return this._uniform_name;
	}

	get uniform() {
		return (this._uniform = this._uniform || this._create_uniform());
	}

	private _create_uniform() {
		return ParamConfig.uniform_by_type(this._type);
	}

	get param_options() {
		switch (this._type) {
			case ParamType.OPERATOR_PATH:
				return {node_selection: {context: NodeContext.COP}}; // TODO: typescript - why is COP here?
			default:
				return {};
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
				return {value: new Vector3(0, 0, 0)};
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

	async set_uniform_value(node: BaseNodeType) {
		// return new Promise( async (resolve, reject)=>{
		const uniform = this.uniform;
		// the cache cannot be trusted...
		const param = node.params.get(this._name) as TypedParam<T>;
		if (param) {
			await param.compute(); //node[node.param_cache_name(this._name)]
			const value = param.value;

			if ((value != null && this.has_value_changed(value)) || this.is_video_texture()) {
				// this._update_cached_value(value);
				// console.log(this._name, value)

				switch (this._type) {
					case ParamType.OPERATOR_PATH: {
						await this.set_uniform_value_from_texture((<unknown>param) as OperatorPathParam, uniform);
						break;
					}
					case ParamType.RAMP: {
						this.set_uniform_value_from_ramp((<unknown>param) as RampParam, uniform);
						break;
					}
					default: {
						uniform.value = param.value;
						break;
					}
				}
				// resolve()
			} // else {
			//	resolve()
			//}
			// })
		}
	}

	async set_uniform_value_from_texture(param: OperatorPathParam, uniform: IUniform) {
		// this._texture_loader = this._texture_loader || new CoreTextureLoader(node, node.param(this.name()))

		// // param.graph_disconnect_predecessors()
		// const texture = await this._texture_loader.load_texture_from_url_or_op( url );
		// uniform.value = texture
		const found_node = param.found_node();
		if (found_node) {
			const container = await found_node.request_container();
			const texture = container.texture();
			uniform.value = texture;
		} else {
			uniform.value = null;
		}
	}

	set_uniform_value_from_ramp(param: RampParam, uniform: IUniform) {
		uniform.value = param.ramp_texture();
	}

	has_value_changed(new_value: ParamValuesTypeMap[T]): boolean {
		const param_constructor = ParamConstructorByType[this._type];
		if (this._cached_param_value) {
			const has_changed = !param_constructor.are_values_equal(new_value, this._cached_param_value);
			if (has_changed) {
				this._cached_param_value = param_constructor.clone_value(new_value);
			}
			return has_changed;
		} else {
			this._cached_param_value = param_constructor.clone_value(new_value);
			return false;
		}

		// let has_changed = false;
		// if (this._type == ParamType.RAMP) {
		// 	has_changed = new_value.uuid() != this._cached_param_value;
		// 	// if(has_changed){ this._cached_param_value = new_value.uuid() }
		// } else {
		// 	if (this._cached_param_value != null) {
		// 		if (lodash_isString(new_value) || lodash_isNumber(new_value)) {
		// 			// console.log("new f", new_value, this._cached_param_value)
		// 			has_changed = this._cached_param_value != new_value;
		// 		} else {
		// 			if (new_value != null) {
		// 				// console.log("new v", new_value, this._cached_param_value)
		// 				has_changed = new_value.toArray().join('.') != this._cached_param_value.toArray().join('.');
		// 			} else {
		// 				has_changed = this._cached_param_value != new_value;
		// 			}
		// 		}
		// 	} else {
		// 		has_changed = true;
		// 	}
		// 	// this._cached_param_value = new_value
		// }
		// return has_changed;
	}
	// private _update_cached_value(new_value) {
	// 	// console.log("_update_cached_value", this._name, new_value)
	// 	if (this._type == 'ramp') {
	// 		this._cached_param_value = new_value.uuid();
	// 	} else {
	// 		if (lodash_isString(new_value) || lodash_isNumber(new_value)) {
	// 			this._cached_param_value = new_value;
	// 		} else {
	// 			// make sure to copy the value, not assign to it
	// 			// otherwise we won't detect changes (since the objects would be the same)
	// 			this._cached_param_value = this._cached_param_value || new_value.clone();
	// 			this._cached_param_value.copy(new_value);
	// 		}
	// 	}
	// }

	is_video_texture(): boolean {
		let result = false;
		const uniform = this.uniform;
		if (uniform) {
			const value = uniform.value;
			if (value) {
				result = value.constructor == VideoTexture;
			}
		}

		return result;
	}
}
