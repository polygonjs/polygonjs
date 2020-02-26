// import {Color} from 'three/src/math/Color';
// import {Vector2} from 'three/src/math/Vector2';
// import {Vector3} from 'three/src/math/Vector3';
// import {Vector4} from 'three/src/math/Vector4';

// import lodash_each from 'lodash/each';
// import lodash_values from 'lodash/values';

import {BaseNodeType} from '../../_Base';
import {BaseParamType} from '../../../params/_Base';
import {ParamOptions} from '../../../params/utils/OptionsController';
import {CoreGraphNode} from '../../../../core/graph/CoreGraphNode';

// import {TypedParam} from '../../../params/_Base';
import {FloatParam} from '../../../params/Float';
import {OperatorPathParam} from '../../../params/OperatorPath';

// import {Vector2} from 'three/src/math/Vector2';
// import {Vector3} from 'three/src/math/Vector3';
// import {Color} from 'three/src/math/Color';
// import {RampValue} from '../../../params/ramp/RampValue';
import {ParamType} from '../../../poly/ParamType';
import {ParamEvent} from '../../../poly/ParamEvent';
// import {RampValue} from '../../../params/ramp/RampValue';
// import {Vector4} from 'three/src/math/Vector4';
import {NodeParamsConfig} from './ParamsConfig';

import {ParamConstructorMap} from '../../../params/types/ParamConstructorMap';
import {ParamConstructorByType} from '../../../params/types/ParamConstructorByType';
import {ParamInitValuesTypeMap} from '../../../params/types/ParamInitValuesTypeMap';
import {ParamValuesTypeMap} from '../../../params/types/ParamValuesTypeMap';

// export type ParamInitValue =
// 	| StringOrNumber
// 	| StringOrNumber2
// 	| StringOrNumber3
// 	| StringOrNumber4
// 	| boolean
// 	| string
// 	| null
// 	| Color
// 	| Vector2
// 	| Vector3
// 	| Vector4
// 	| RampValue
// 	| RampValueJson;

// export type ParamValueSerialized =
// 	| StringOrNumber
// 	| StringOrNumber2
// 	| StringOrNumber3
// 	| StringOrNumber4
// 	| boolean
// 	| string
// 	| null
// 	| RampValueJson;

// export type ParamValue = boolean | Color | number | string | RampValue | Vector2 | Vector3 | Vector4 | null;
// export type MultipleNumericParamValue = Vector2 | Vector3 | Vector4 | Color;
// export type NumericParamValue = MultipleNumericParamValue | number;

const NODE_SIMPLE_NAME = 'params';

export type OnSceneLoadHook = () => void;
type PostCreateParamsHook = () => void;

export class ParamsController {
	private _param_create_mode: boolean = false;
	private _params_by_name: Dictionary<BaseParamType> = {};
	// caches
	private _params_list: BaseParamType[] = [];
	private _param_names: string[] = [];
	private _non_spare_params: BaseParamType[] = [];
	private _spare_params: BaseParamType[] = [];
	private _non_spare_param_names: string[] = [];
	private _spare_param_names: string[] = [];

	private _params_node: CoreGraphNode | undefined;
	// private _params_eval_key: string;
	private _params_added_since_last_params_eval: boolean = false;
	// private _current_param_folder_name: string | undefined;

	// hooks
	private _post_create_params_hook: PostCreateParamsHook | undefined;
	private _on_scene_load_hooks: OnSceneLoadHook[] | undefined;
	private _on_scene_load_hook_names: string[] | undefined;

	constructor(protected node: BaseNodeType) {}

	private init_dependency_node() {
		if (!this._params_node) {
			// TODO: consider not having a params_node for nodes which have no parameters
			this._params_node = new CoreGraphNode(this.node.scene, NODE_SIMPLE_NAME);
			// this._params_node.set_scene(this.node.scene);
			this.node.add_graph_input(this._params_node);
		}
	}

	init() {
		this.init_dependency_node();
		// this.reset_params()
		this._param_create_mode = true;

		this.init_from_params_config();
		this.node.create_params();
		this._post_create_params();
	}
	private _post_create_params() {
		this._update_caches();
		// this._create_params_ui_data_dependencies();
		this.init_param_accessors();
		this._param_create_mode = false;

		this.run_post_create_params_hook();

		// This was to debug a weird bug where I was adding nodes to the list
		// of params, from the DependenciesController
		// this._params_list.push = (...items: BaseParamType[]) => {
		// 	if (items[0] && !items[0].compute) {
		// 		console.warn('adding params', items);
		// 	}
		// 	for (let i of items) {
		// 		this._params_list[this._params_list.length] = i;
		// 	}
		// 	return 0;
		// };
	}
	post_create_spare_params() {
		this._update_caches();
		this.init_param_accessors();
	}

	private init_from_params_config() {
		const params_config = this.node.params_config as NodeParamsConfig;
		if (params_config) {
			for (let name of Object.keys(params_config)) {
				const config = params_config[name];
				this.add_param(config.type, name, config.init_value, config.options);
			}
		}
	}
	private init_param_accessors() {
		let current_names_in_accessor = Object.getOwnPropertyNames(this.node.pv);
		this._remove_unneeded_accessors(current_names_in_accessor);
		// update var after having removed accessors
		current_names_in_accessor = Object.getOwnPropertyNames(this.node.pv);

		for (let param of this.all) {
			const is_spare: boolean = param.options.is_spare;

			const param_not_yet_in_accessors = !current_names_in_accessor.includes(param.name);

			if (param_not_yet_in_accessors || is_spare) {
				Object.defineProperty(this.node.pv, param.name, {
					get: () => {
						return param.value;
					},
					// only spare parameters can be removed
					configurable: is_spare,
				});
				Object.defineProperty(this.node.p, param.name, {
					get: () => {
						return param;
					},
					configurable: is_spare,
				});
			}
		}
	}
	private _remove_unneeded_accessors(current_names_in_accessor: string[]) {
		const current_param_names = this._param_names;
		const names_to_remove = [];
		for (let current_name_in_accessor of current_names_in_accessor) {
			if (!current_param_names.includes(current_name_in_accessor)) {
				names_to_remove.push(current_name_in_accessor);
			}
		}

		for (let name_to_remove of names_to_remove) {
			Object.defineProperty(this.node.pv, name_to_remove, {
				get: () => {
					return undefined;
				},
				configurable: true,
			});
			Object.defineProperty(this.node.p, name_to_remove, {
				get: () => {
					return undefined;
				},
				configurable: true,
			});
		}
	}

	get params_node() {
		return this._params_node;
	}
	get all() {
		return this._params_list;
	}
	get non_spare() {
		return this._non_spare_params;
	}
	get spare() {
		return this._spare_params;
	}
	get names(): string[] {
		return this._param_names;
	}
	get non_spare_names(): string[] {
		return this._non_spare_param_names;
	}
	get spare_names(): string[] {
		return this._spare_param_names;
	}
	// get params_by_name() {
	// 	return this._params_by_name;
	// }
	// get all_params() {
	// 	// return lodash_concat(lodash_values(this._params), lodash_values(this._spare_params));
	// 	return lodash_values(this._params);
	// }

	private set_with_type<T extends ParamType>(name: string, value: ParamInitValuesTypeMap[T], type: T) {
		const param = this.param_with_type(name, type);
		if (param) {
			param.set(value as never);
		} else {
			console.warn(`param ${name} not found with type ${type}`);
		}
	}
	set_float(name: string, value: ParamInitValuesTypeMap[ParamType.FLOAT]) {
		this.set_with_type(name, value, ParamType.FLOAT);
	}
	set_vector3(name: string, value: ParamInitValuesTypeMap[ParamType.VECTOR3]) {
		this.set_with_type(name, value, ParamType.VECTOR3);
	}

	has_param(name: string) {
		return this._params_by_name[name] != null;
	}
	has(name: string) {
		return this.has_param(name);
	}
	get(name: string) {
		return this.param(name);
	}
	param_with_type<T extends ParamType>(name: string, type: T): ParamConstructorMap[T] | undefined {
		const param = this.param(name);
		if (param && param.type == type) {
			return param as ParamConstructorMap[T];
		}
	}
	get_float(name: string): FloatParam {
		return this.param_with_type(name, ParamType.FLOAT) as FloatParam;
	}
	get_operator_path(name: string): OperatorPathParam {
		return this.param_with_type(name, ParamType.OPERATOR_PATH) as OperatorPathParam;
	}
	value(name: string) {
		return this.param(name)?.value;
	}
	value_with_type<T extends ParamType>(name: string, type: T): ParamValuesTypeMap[T] {
		return this.param_with_type(name, type)?.value as ParamValuesTypeMap[T];
		// const param = this.param(name);
		// if (param && param.type() == type) {
		// 	return param.value();
		// }
	}
	boolean(name: string) {
		return this.value_with_type(name, ParamType.BOOLEAN);
	}
	float(name: string) {
		return this.value_with_type(name, ParamType.FLOAT);
	}
	integer(name: string) {
		return this.value_with_type(name, ParamType.INTEGER);
	}
	string(name: string) {
		return this.value_with_type(name, ParamType.STRING);
	}
	vector2(name: string) {
		return this.value_with_type(name, ParamType.VECTOR2);
	}
	vector3(name: string) {
		return this.value_with_type(name, ParamType.VECTOR3);
	}
	color(name: string) {
		return this.value_with_type(name, ParamType.COLOR);
	}

	param(name: string) {
		const p = this._params_by_name[name];
		if (p != null) {
			return p;
		} else {
			console.warn(
				`tried to access param '${name}' in node ${this.node.full_path()}, but existing params are: ${
					this.names
				}`
			);
			return null;
		}
	}
	// param_cache_name(param_name: string) {
	// 	return `_param_${param_name}`;
	// }

	delete_params(param_names: string[]) {
		for (let param_name of param_names) {
			this.delete_param(param_name);
		}
		this._update_caches();
	}
	delete_param(param_name: string) {
		const param = this._params_by_name[param_name];
		if (param) {
			if (this._params_node) {
				this._params_node.remove_graph_input(this._params_by_name[param_name]);
			}
			param.set_node(null);
			delete this._params_by_name[param_name];
			if (param.is_multiple && param.components) {
				for (let component of param.components) {
					const child_name = component.name;
					delete this._params_by_name[child_name];
				}
			}

			// const name_index = this._param_names.indexOf(param_name)
			// if(name_index >= 0){
			// 	this._param_names.splice(name_index, 1)
			// }
			param.emit(ParamEvent.DELETED);
		} else {
			throw new Error(`param '${param_name}' does not exist on node ${this.node.full_path()}`);
		}
	}

	add_param<T extends ParamType>(
		type: T,
		name: string,
		init_value: ParamInitValuesTypeMap[T],
		options: ParamOptions = {}
	): ParamConstructorMap[T] | undefined {
		const is_spare = options['spare'] || false;
		if (this._param_create_mode === false && !is_spare) {
			console.warn(
				`node ${this.node.full_path()} (${
					this.node.type
				}) param '${name}' cannot be created outside of create_params`
			);
		}
		if (this.node.scene == null) {
			console.warn(`node ${this.node.full_path()} (${this.node.type}) has no scene assigned`);
		}

		const constructor = ParamConstructorByType[type];
		if (constructor != null) {
			const existing_param = this._params_by_name[name];
			if (existing_param) {
				if (is_spare) {
					// delete the old one, otherwise the gl nodes when saved will attempt to set the value
					// of a param with the potentially wrong type
					if (existing_param.type != type) {
						this.delete_param(existing_param.name);
					}
				} else {
					// check that the param is spare, so that the ones generated by gl nodes are not generating an exception
					console.warn(`a param named ${name} already exists`, this.node);
				}
			}
			const param: ParamConstructorMap[T] = new constructor(this.node.scene);
			param.options.set(options);

			// param.set_scene(this.node.scene);
			param.set_name(name);
			param.set_init_value(init_value as never);
			param.init_components();
			param.set_node(this.node);
			// param.initialize();
			// param.ui_data.set_folder_name(this.current_param_folder_name());

			this._params_by_name[param.name] = param as BaseParamType;
			// this._params_list.push(param);
			// this._param_names[param.name()] = true; //.push(param.name());

			// we add the components, so that we can access them with expressions like ch('ty')
			if (param.is_multiple && param.components) {
				for (let component of param.components) {
					this._params_by_name[component.name] = component as BaseParamType;
				}
			}

			this._params_added_since_last_params_eval = true;

			return param;
		}
	}

	private _update_caches() {
		// _params_list: BaseParam[] = [];
		this._params_list = Object.values(this._params_by_name);
		// _param_names: string[] = [];
		this._param_names = Object.keys(this._params_by_name);
		// _non_spare_params: BaseParam[] = [];
		this._non_spare_params = Object.values(this._params_by_name).filter((p) => !p.options.is_spare);
		// _spare_params: BaseParam[] = [];
		this._spare_params = Object.values(this._params_by_name).filter((p) => p.options.is_spare);
		// _non_spare_param_names: string[] = [];
		this._non_spare_param_names = Object.values(this._params_by_name)
			.filter((p) => !p.options.is_spare)
			.map((p) => p.name);
		// _spare_param_names: string[] = [];
		this._spare_param_names = Object.values(this._params_by_name)
			.filter((p) => p.options.is_spare)
			.map((p) => p.name);
		// delete this._param_names[param_name];

		// // delete from this._params_list
		// let index = -1;
		// for (let i = 0; i < this._params_list.length; i++) {
		// 	if (this._params_list[i].name() == param_name) {
		// 		index = i;
		// 	}
		// }
		// if (index > -1) {
		// 	this._params_list.splice(index, 1);
		// }
	}

	async _eval_param(param: BaseParamType) {
		// return new Promise((resolve, reject)=> {
		// const param_cache_name = this.param_cache_name(param.name());
		// const cached_value = this[param_cache_name] || null;
		if (/*cached_value == null ||*/ param.is_dirty /* || param.is_errored()*/) {
			/*const param_value =*/ await param.compute(); //.then(param_value=>{
			// this[param_cache_name] = param_value;
			if (param.states.error.active) {
				this.node.states.error.set(`param '${param.name}' error: ${param.states.error.message}`);
			}
			// return param_value;
		} else {
			// return param.value;
		}
		// });
	}

	async eval_params(params: BaseParamType[]) {
		// let param: BaseParam;
		const promises = [];
		for (let i = 0; i < params.length; i++) {
			if (params[i].is_dirty) {
				promises.push(this._eval_param(params[i]));
			}
		}
		/*const param_values =*/ await Promise.all(promises);

		// const param_eval_keys = [];
		// let param_value;
		// for (let i = 0; i < params.length; i++) {
		// 	param = params[i];
		// 	param_value = param_values[i];
		// 	const param_eval_key = param.eval_key(param_value);
		// 	param_eval_keys.push(param_eval_key);
		// }
		if (this.node.states.error.active) {
			this.node.set_container(null);
		}
		// return param_eval_keys.join('-');
		// const promises = lodash_map(params, (param, index)=> {
		// 	return this.self._eval_param(param).then(param_value => {
		// 		const param_eval_key = param.eval_key(param_value);
		// 		return param_eval_keys.push(param_eval_key);
		// 	})
		// })

		// return new Promise((resolve, reject)=> {
		// 	return Promise.all(promises).then(() => {
		// 		if (this.self.is_errored()) {
		// 			this.self.set_container(null);
		// 		}
		// 		// this._params_node.remove_dirty_state()
		// 		return resolve(param_eval_keys.join('-'));
		// 	})
		// })
	}

	// invalidates_param_results() {
	// 	// this.params().forEach((param)=>{ param.invalidates_result() });
	// 	lodash_each(this.params(), (param) => param.invalidates_result());
	// 	// for(let i=0; i<this._params_list.length; i++){
	// 	// 	this._params_list[i].invalidates_result()
	// 	// }
	// }

	async eval_all() {
		if (this._params_node) {
			if (this._params_node.is_dirty || this._params_added_since_last_params_eval) {
				// const param_names = lodash_values(this.param_names())
				// const params = param_names.map(param_name=> this.param(param_name))
				//params = lodash_filter params, (param)->!param.has_parent_param()
				// if (params.length > 0) {
				await this.eval_params(this._params_list);

				// this._build_params_eval_key()
				this._params_node.remove_dirty_state();
				// }
				this._params_added_since_last_params_eval = false;
			}
		}
		// return this._params_eval_key
	}

	//
	//
	// HOOKS
	//
	//
	set_post_create_params_hook(hook: PostCreateParamsHook) {
		this._post_create_params_hook = hook;
	}
	run_post_create_params_hook() {
		if (this._post_create_params_hook) {
			this._post_create_params_hook();
		}
	}
	add_on_scene_load_hook(name: string, method: OnSceneLoadHook) {
		this._on_scene_load_hook_names = this._on_scene_load_hook_names || [];
		this._on_scene_load_hooks = this._on_scene_load_hooks || [];

		if (!this._on_scene_load_hook_names.includes(name)) {
			this._on_scene_load_hook_names.push(name);
			this._on_scene_load_hooks.push(method);
		} else {
			console.warn(`hook with name ${name} already exists`, this._on_scene_load_hook_names);
		}
	}
	run_on_scene_load_hooks() {
		if (this._on_scene_load_hooks) {
			for (let hook of this._on_scene_load_hooks) {
				hook();
			}
		}
	}

	// private _create_params_ui_data_dependencies() {
	// 	const dependent_params = this._params_list.filter((p) => p.options.ui_data_depends_on_other_params());

	// 	dependent_params.forEach((p) => {
	// 		p.options.set_ui_data_dependency();
	// 	});
	// }

	// within_param_folder(folder_name: string, callback: () => void) {
	// 	const previous_folder_name = this._current_param_folder_name;
	// 	this._current_param_folder_name = folder_name;
	// 	callback();
	// 	this._current_param_folder_name = previous_folder_name;
	// }
	// current_param_folder_name(): string | undefined {
	// 	return this._current_param_folder_name;
	// }
}
