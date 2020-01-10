// import {Color} from 'three/src/math/Color';
// import {Vector2} from 'three/src/math/Vector2';
// import {Vector3} from 'three/src/math/Vector3';
// import {Vector4} from 'three/src/math/Vector4';

// import lodash_each from 'lodash/each';
// import lodash_values from 'lodash/values';

import {BaseNode} from 'src/engine/nodes/_Base';
import {BaseParam} from 'src/engine/params/_Base';
import {ParamOptions} from 'src/engine/params/utils/OptionsController';
import {NodeSimple} from 'src/core/graph/NodeSimple';

// import {TypedParam} from 'src/engine/params/_Base';
import {BooleanParam} from 'src/engine/params/Boolean';
import {ButtonParam} from 'src/engine/params/Button';
import {ColorParam} from 'src/engine/params/Color';
import {FloatParam} from 'src/engine/params/Float';
import {IntegerParam} from 'src/engine/params/Integer';
import {OperatorPathParam} from 'src/engine/params/OperatorPath';
import {RampParam} from 'src/engine/params/Ramp';
import {SeparatorParam} from 'src/engine/params/Separator';
import {StringParam} from 'src/engine/params/String';
import {Vector2Param} from 'src/engine/params/Vector2';
import {Vector3Param} from 'src/engine/params/Vector3';
import {Vector4Param} from 'src/engine/params/Vector4';

import {Vector2} from 'three/src/math/Vector2';
import {Vector3} from 'three/src/math/Vector3';
import {Color} from 'three/src/math/Color';
// import {RampValue} from 'src/engine/params/ramp/RampValue';

const ParamConstructorMap = {
	[ParamType.BOOLEAN]: BooleanParam,
	[ParamType.BUTTON]: ButtonParam,
	[ParamType.COLOR]: ColorParam,
	[ParamType.FLOAT]: FloatParam,
	[ParamType.INTEGER]: IntegerParam,
	[ParamType.OPERATOR_PATH]: OperatorPathParam,
	[ParamType.RAMP]: RampParam,
	[ParamType.SEPARATOR]: SeparatorParam,
	[ParamType.STRING]: StringParam,
	[ParamType.VECTOR2]: Vector2Param,
	[ParamType.VECTOR3]: Vector3Param,
	[ParamType.VECTOR4]: Vector4Param,
};

const NODE_SIMPLE_NAME = 'params';

function _ParamCheckNameConsistency<T extends BaseNode>(name: string, target: T, key: keyof T, type: ParamType) {
	const key_s = key as string;
	if (key_s != `_param_${name}`) {
		console.warn('param name inconsistent');
	}
	const param = target.params.get(name);
	if (param && param.type() != type) {
		console.warn('param type inconsistent');
	}
}
const _ParamB = function ParamF(name: string) {
	return <T extends BaseNode>(target: T, key: keyof T) => {
		_ParamCheckNameConsistency(name, target, key, ParamType.BOOLEAN);
		Object.defineProperty(target, key, {
			get: () => target.params.boolean(name),
		});
	};
};
const _ParamF = function ParamF(name: string) {
	return <T extends BaseNode>(target: T, key: keyof T) => {
		_ParamCheckNameConsistency(name, target, key, ParamType.FLOAT);
		Object.defineProperty(target, key, {
			get: () => target.params.float(name),
		});
	};
};
const _ParamS = function ParamF(name: string) {
	return <T extends BaseNode>(target: T, key: keyof T) => {
		_ParamCheckNameConsistency(name, target, key, ParamType.STRING);
		Object.defineProperty(target, key, {
			get: () => target.params.string(name),
		});
	};
};
const _ParamV2 = function ParamF(name: string) {
	return <T extends BaseNode>(target: T, key: keyof T) => {
		_ParamCheckNameConsistency(name, target, key, ParamType.VECTOR2);
		Object.defineProperty(target, key, {
			get: () => target.params.vector2(name),
		});
	};
};
const _ParamV3 = function ParamF(name: string) {
	return <T extends BaseNode>(target: T, key: keyof T) => {
		_ParamCheckNameConsistency(name, target, key, ParamType.VECTOR3);
		Object.defineProperty(target, key, {
			get: () => target.params.vector3(name),
		});
	};
};
const _ParamC = function ParamF(name: string) {
	return <T extends BaseNode>(target: T, key: keyof T) => {
		_ParamCheckNameConsistency(name, target, key, ParamType.COLOR);
		Object.defineProperty(target, key, {
			get: () => target.params.color(name),
		});
	};
};
declare global {
	const ParamB: typeof _ParamB;
	const ParamF: typeof _ParamF;
	const ParamS: typeof _ParamS;
	const ParamV2: typeof _ParamV2;
	const ParamV3: typeof _ParamV3;
	const ParamC: typeof _ParamC;
}

export class ParamsController {
	private _param_create_mode: boolean = false;
	private _params_by_name: Dictionary<BaseParam> = {};
	// caches
	private _params_list: BaseParam[] = [];
	private _param_names: string[] = [];
	private _non_spare_params: BaseParam[] = [];
	private _spare_params: BaseParam[] = [];
	private _non_spare_param_names: string[] = [];
	private _spare_param_names: string[] = [];

	private _params_node: NodeSimple;
	// private _params_eval_key: string;
	private _params_added_since_last_params_eval: boolean = false;
	private _current_param_folder_name: string | null = null;

	constructor(protected node: BaseNode) {}

	private init_dependency_node() {
		if (!this._params_node) {
			// TODO: consider not having a params_node for nodes which have no parameters
			this._params_node = new NodeSimple(NODE_SIMPLE_NAME);
			this._params_node.set_scene(this.node.scene());
			this.node.add_graph_input(this._params_node);
		}
	}

	init() {
		this.init_dependency_node();
		// this.reset_params()
		this._param_create_mode = true;

		// this._init_spare_params();
		this.node.create_params();
		this._update_caches();
		this._create_params_ui_data_dependencies();
		this._param_create_mode = false;

		// this.post_create_params(); // TODO: typescript
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

	private set_with_type(name: string, value: any, type: ParamType) {
		const param = this.param_with_type(name, type);
		if (param) {
			param.set(value);
		} else {
			console.warn(`param ${name} not found with type ${type}`);
		}
	}
	set_float(name: string, value: number) {
		this.set_with_type(name, value, ParamType.FLOAT);
	}
	set_vector3(name: string, value: [number, number, number]) {
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
	param_with_type(name: string, type: ParamType) {
		const param = this.param(name);
		if (param && param.type() == type) {
			return param;
		}
	}
	get_operator_path(name: string): OperatorPathParam {
		return this.param_with_type(name, ParamType.OPERATOR_PATH) as OperatorPathParam;
	}
	value(name: string) {
		return this.param(name)?.value();
	}
	value_with_type(name: string, type: ParamType) {
		return this.param_with_type(name, type)?.value();
		// const param = this.param(name);
		// if (param && param.type() == type) {
		// 	return param.value();
		// }
	}
	boolean(name: string) {
		return this.value_with_type(name, ParamType.FLOAT) as boolean;
	}
	float(name: string) {
		return this.value_with_type(name, ParamType.FLOAT) as number;
	}
	integer(name: string) {
		return this.value_with_type(name, ParamType.INTEGER) as number;
	}
	string(name: string) {
		return this.value_with_type(name, ParamType.STRING) as string;
	}
	vector2(name: string) {
		return this.value_with_type(name, ParamType.VECTOR2) as Vector2;
	}
	vector3(name: string) {
		return this.value_with_type(name, ParamType.VECTOR3) as Vector3;
	}
	color(name: string) {
		return this.value_with_type(name, ParamType.COLOR) as Color;
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
			this._params_node.remove_graph_input(this._params_by_name[param_name]);
			param.set_node(null);
			delete this._params_by_name[param_name];
			if (param.is_multiple()) {
				param.components().forEach((component) => {
					const child_name = component.name();
					delete this._params_by_name[child_name];
				});
			}

			// const name_index = this._param_names.indexOf(param_name)
			// if(name_index >= 0){
			// 	this._param_names.splice(name_index, 1)
			// }
			param.emit('param_deleted');
		} else {
			throw new Error(`param '${param_name}' does not exist on node ${this.node.full_path()}`);
		}
	}

	add_param(type: ParamType, name: string, default_value: any, options: ParamOptions = {}): BaseParam | null {
		const is_spare = options['spare'] || false;
		if (this._param_create_mode === false && !is_spare) {
			console.warn(
				`node ${this.node.full_path()} (${this.node.type()}) param '${name}' cannot be created outside of create_params`
			);
			return null;
		}
		if (this.node.scene() == null) {
			console.warn(`node ${this.node.full_path()} (${this.node.type()}) has no scene assigned`);
			return null;
		}

		const constructor = ParamConstructorMap[type];
		if (constructor != null) {
			const existing_param = this._params_by_name[name];
			if (existing_param) {
				if (is_spare) {
					// delete the old one, otherwise the gl nodes when saved will attempt to set the value
					// of a param with the potentially wrong type
					if (existing_param.type() != type) {
						this.delete_param(existing_param.name());
					}
				} else {
					// check that the param is spare, so that the ones generated by gl nodes are not generating an exception
					console.warn(`a param named ${name} already exists`);
					return null;
				}
			}
			const param: BaseParam = new constructor();
			param.set_default_value(default_value);
			param.options.set(options);

			param.set_scene(this.node.scene());
			param.set_name(name);
			param.initialize();
			param.ui_data.set_folder_name(this.current_param_folder_name());

			this._params_by_name[param.name()] = param;
			// this._params_list.push(param);
			// this._param_names[param.name()] = true; //.push(param.name());
			param.set_node(this.node);

			if (param.is_multiple()) {
				for (let component of param.components()) {
					this._params_by_name[component.name()] = component;
				}
			}

			this._params_added_since_last_params_eval = true;

			return param;
		}
		return null;
	}

	private _update_caches() {
		// _params_list: BaseParam[] = [];
		this._params_list = Object.values(this._params_by_name);
		// _param_names: string[] = [];
		this._param_names = Object.keys(this._params_by_name);
		// _non_spare_params: BaseParam[] = [];
		this._non_spare_params = Object.values(this._params_by_name).filter((p) => !p.options.is_spare());
		// _spare_params: BaseParam[] = [];
		this._spare_params = Object.values(this._params_by_name).filter((p) => p.options.is_spare());
		// _non_spare_param_names: string[] = [];
		this._non_spare_param_names = Object.values(this._params_by_name)
			.filter((p) => !p.options.is_spare())
			.map((p) => p.name());
		// _spare_param_names: string[] = [];
		this._spare_param_names = Object.values(this._params_by_name)
			.filter((p) => p.options.is_spare())
			.map((p) => p.name());
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

	async _eval_param(param: BaseParam) {
		// return new Promise((resolve, reject)=> {
		// const param_cache_name = this.param_cache_name(param.name());
		// const cached_value = this[param_cache_name] || null;
		if (/*cached_value == null ||*/ param.is_dirty() /* || param.is_errored()*/) {
			const param_value = await param.eval_p(); //.then(param_value=>{
			// this[param_cache_name] = param_value;
			if (param.states.error.active) {
				this.node.states.error.set(`param '${param.name()}' error: ${param.states.error.message}`);
			}
			return param_value;
		} else {
			return param.value();
		}
		// });
	}

	async eval_params(params: BaseParam[]) {
		// let param: BaseParam;
		const promises = [];
		for (let i = 0; i < params.length; i++) {
			promises.push(this._eval_param(params[i]));
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
		if (this._params_node.is_dirty() || this._params_added_since_last_params_eval) {
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
		// return this._params_eval_key
	}

	_create_params_ui_data_dependencies() {
		const dependent_params = this._params_list.filter((p) => p.options.ui_data_depends_on_other_params());

		dependent_params.forEach((p) => {
			p.options.set_ui_data_dependency();
		});
	}

	within_param_folder(folder_name: string, callback: () => void) {
		const previous_folder_name = this._current_param_folder_name;
		this._current_param_folder_name = folder_name;
		callback();
		this._current_param_folder_name = previous_folder_name;
	}
	current_param_folder_name(): string | null {
		return this._current_param_folder_name;
	}
}
