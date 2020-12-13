import {CoreGraphNode as CoreGraphNode2} from "../../../../core/graph/CoreGraphNode";
import {ParamType as ParamType2} from "../../../poly/ParamType";
import {ParamConstructorByType as ParamConstructorByType2} from "../../../params/types/ParamConstructorByType";
import {NodeEvent as NodeEvent2} from "../../../poly/NodeEvent";
import {ParamsLabelController as ParamsLabelController2} from "./ParamsLabelController";
import {Poly as Poly2} from "../../../Poly";
const NODE_SIMPLE_NAME = "params";
export class ParamsController {
  constructor(node) {
    this.node = node;
    this._param_create_mode = false;
    this._params_created = false;
    this._params_by_name = {};
    this._params_list = [];
    this._param_names = [];
    this._non_spare_params = [];
    this._spare_params = [];
    this._non_spare_param_names = [];
    this._spare_param_names = [];
    this._params_added_since_last_params_eval = false;
  }
  get label() {
    return this._label_controller = this._label_controller || new ParamsLabelController2();
  }
  has_label_controller() {
    return this._label_controller != null;
  }
  init_dependency_node() {
    if (!this._params_node) {
      this._params_node = new CoreGraphNode2(this.node.scene, NODE_SIMPLE_NAME);
      this.node.add_graph_input(this._params_node, false);
    }
  }
  init() {
    this.init_dependency_node();
    this._param_create_mode = true;
    this.init_from_params_config();
    this.node.create_params();
    this._post_create_params();
  }
  _post_create_params() {
    this._update_caches();
    this.init_param_accessors();
    this._param_create_mode = false;
    this._params_created = true;
    this.run_post_create_params_hooks();
  }
  post_create_spare_params() {
    this._update_caches();
    this.init_param_accessors();
  }
  update_params(options) {
    let has_created_a_param = false;
    let has_deleted_a_param = false;
    if (options.names_to_delete) {
      for (let param_name of options.names_to_delete) {
        if (this.has(param_name)) {
          this.delete_param(param_name);
          has_deleted_a_param = true;
        }
      }
    }
    if (options.to_add) {
      for (let param_data of options.to_add) {
        const param = this.add_param(param_data.type, param_data.name, param_data.init_value, param_data.options);
        if (param) {
          if (param_data.raw_input != null) {
            param.set(param_data.raw_input);
          }
          has_created_a_param = true;
        }
      }
    }
    if (has_deleted_a_param || has_created_a_param) {
      this.post_create_spare_params();
      this.node.scene.references_controller.notify_params_updated(this.node);
      this.node.emit(NodeEvent2.PARAMS_UPDATED);
    }
  }
  init_from_params_config() {
    const params_config = this.node.params_config;
    let init_values_used = false;
    if (params_config) {
      for (let name of Object.keys(params_config)) {
        const config = params_config[name];
        let init_value;
        if (this.node.params_init_value_overrides) {
          init_value = this.node.params_init_value_overrides[name];
          init_values_used = true;
        }
        this.add_param(config.type, name, config.init_value, config.options, init_value);
      }
    }
    if (init_values_used) {
      this.node.set_dirty();
    }
    this.node.params_init_value_overrides = void 0;
  }
  init_param_accessors() {
    let current_names_in_accessor = Object.getOwnPropertyNames(this.node.pv);
    this._remove_unneeded_accessors(current_names_in_accessor);
    current_names_in_accessor = Object.getOwnPropertyNames(this.node.pv);
    for (let param of this.all) {
      const is_spare = param.options.is_spare;
      const param_not_yet_in_accessors = !current_names_in_accessor.includes(param.name);
      if (param_not_yet_in_accessors || is_spare) {
        Object.defineProperty(this.node.pv, param.name, {
          get: () => {
            return param.value;
          },
          configurable: is_spare
        });
        Object.defineProperty(this.node.p, param.name, {
          get: () => {
            return param;
          },
          configurable: is_spare
        });
      }
    }
  }
  _remove_unneeded_accessors(current_names_in_accessor) {
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
          return void 0;
        },
        configurable: true
      });
      Object.defineProperty(this.node.p, name_to_remove, {
        get: () => {
          return void 0;
        },
        configurable: true
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
  get names() {
    return this._param_names;
  }
  get non_spare_names() {
    return this._non_spare_param_names;
  }
  get spare_names() {
    return this._spare_param_names;
  }
  set_with_type(param_name, value, type) {
    const param = this.param_with_type(param_name, type);
    if (param) {
      param.set(value);
    } else {
      Poly2.warn(`param ${param_name} not found with type ${type}`);
    }
  }
  set_float(param_name, value) {
    this.set_with_type(param_name, value, ParamType2.FLOAT);
  }
  set_vector3(param_name, value) {
    this.set_with_type(param_name, value, ParamType2.VECTOR3);
  }
  has_param(param_name) {
    return this._params_by_name[param_name] != null;
  }
  has(param_name) {
    return this.has_param(param_name);
  }
  get(param_name) {
    return this.param(param_name);
  }
  param_with_type(param_name, type) {
    const param = this.param(param_name);
    if (param && param.type == type) {
      return param;
    }
  }
  get_float(param_name) {
    return this.param_with_type(param_name, ParamType2.FLOAT);
  }
  get_operator_path(param_name) {
    return this.param_with_type(param_name, ParamType2.OPERATOR_PATH);
  }
  value(param_name) {
    return this.param(param_name)?.value;
  }
  value_with_type(param_name, type) {
    return this.param_with_type(param_name, type)?.value;
  }
  boolean(param_name) {
    return this.value_with_type(param_name, ParamType2.BOOLEAN);
  }
  float(param_name) {
    return this.value_with_type(param_name, ParamType2.FLOAT);
  }
  integer(param_name) {
    return this.value_with_type(param_name, ParamType2.INTEGER);
  }
  string(param_name) {
    return this.value_with_type(param_name, ParamType2.STRING);
  }
  vector2(param_name) {
    return this.value_with_type(param_name, ParamType2.VECTOR2);
  }
  vector3(param_name) {
    return this.value_with_type(param_name, ParamType2.VECTOR3);
  }
  color(param_name) {
    return this.value_with_type(param_name, ParamType2.COLOR);
  }
  param(param_name) {
    const p = this._params_by_name[param_name];
    if (p != null) {
      return p;
    } else {
      Poly2.warn(`tried to access param '${param_name}' in node ${this.node.full_path()}, but existing params are: ${this.names} on node ${this.node.full_path()}`);
      return null;
    }
  }
  delete_param(param_name) {
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
    } else {
      throw new Error(`param '${param_name}' does not exist on node ${this.node.full_path()}`);
    }
  }
  add_param(type, param_name, default_value, options = {}, init_data) {
    const is_spare = options["spare"] || false;
    if (this._param_create_mode === false && !is_spare) {
      Poly2.warn(`node ${this.node.full_path()} (${this.node.type}) param '${param_name}' cannot be created outside of create_params`);
    }
    if (this.node.scene == null) {
      Poly2.warn(`node ${this.node.full_path()} (${this.node.type}) has no scene assigned`);
    }
    const constructor = ParamConstructorByType2[type];
    if (constructor != null) {
      const existing_param = this._params_by_name[param_name];
      if (existing_param) {
        if (is_spare) {
          if (existing_param.type != type) {
            this.delete_param(existing_param.name);
          }
        } else {
          Poly2.warn(`a param named ${param_name} already exists`, this.node);
        }
      }
      const param = new constructor(this.node.scene);
      param.options.set(options);
      param.set_name(param_name);
      param.set_init_value(default_value);
      param.init_components();
      if (init_data == null) {
        param.set(default_value);
      } else {
        if (param.options.is_expression_for_entities) {
          param.set(default_value);
        }
        if (init_data.raw_input != null) {
          param.set(init_data.raw_input);
        } else {
          if (init_data.simple_data != null) {
            param.set(init_data.simple_data);
          } else {
            if (init_data.complex_data != null) {
              const raw_input = init_data.complex_data.raw_input;
              if (raw_input) {
                param.set(raw_input);
              } else {
                param.set(default_value);
              }
              const overriden_options = init_data.complex_data.overriden_options;
              if (overriden_options != null) {
                const keys = Object.keys(overriden_options);
                for (let key of keys) {
                  param.options.set_option(key, overriden_options[key]);
                }
              }
            }
          }
        }
      }
      param.set_node(this.node);
      this._params_by_name[param.name] = param;
      if (param.is_multiple && param.components) {
        for (let component of param.components) {
          this._params_by_name[component.name] = component;
        }
      }
      this._params_added_since_last_params_eval = true;
      return param;
    }
  }
  _update_caches() {
    this._params_list = Object.values(this._params_by_name);
    this._param_names = Object.keys(this._params_by_name);
    this._non_spare_params = Object.values(this._params_by_name).filter((p) => !p.options.is_spare);
    this._spare_params = Object.values(this._params_by_name).filter((p) => p.options.is_spare);
    this._non_spare_param_names = Object.values(this._params_by_name).filter((p) => !p.options.is_spare).map((p) => p.name);
    this._spare_param_names = Object.values(this._params_by_name).filter((p) => p.options.is_spare).map((p) => p.name);
  }
  async _eval_param(param) {
    if (param.is_dirty) {
      await param.compute();
      if (param.states.error.active) {
        this.node.states.error.set(`param '${param.name}' error: ${param.states.error.message}`);
      }
    } else {
    }
  }
  async eval_params(params) {
    const promises = [];
    for (let i = 0; i < params.length; i++) {
      if (params[i].is_dirty) {
        promises.push(this._eval_param(params[i]));
      }
    }
    await Promise.all(promises);
    if (this.node.states.error.active) {
      this.node.set_container(null);
    }
  }
  params_eval_required() {
    return this._params_node && (this._params_node.is_dirty || this._params_added_since_last_params_eval);
  }
  async eval_all() {
    if (this.params_eval_required()) {
      await this.eval_params(this._params_list);
      this._params_node?.remove_dirty_state();
      this._params_added_since_last_params_eval = false;
    }
  }
  on_params_created(hook_name, hook) {
    if (this._params_created) {
      hook();
    } else {
      if (this._post_create_params_hook_names && this._post_create_params_hook_names.includes(hook_name)) {
        Poly2.error(`hook name ${hook_name} already exists`);
        return;
      }
      this._post_create_params_hook_names = this._post_create_params_hook_names || [];
      this._post_create_params_hook_names.push(hook_name);
      this._post_create_params_hooks = this._post_create_params_hooks || [];
      this._post_create_params_hooks.push(hook);
    }
  }
  add_on_scene_load_hook(param_name, method) {
    this._on_scene_load_hook_names = this._on_scene_load_hook_names || [];
    this._on_scene_load_hooks = this._on_scene_load_hooks || [];
    if (!this._on_scene_load_hook_names.includes(param_name)) {
      this._on_scene_load_hook_names.push(param_name);
      this._on_scene_load_hooks.push(method);
    } else {
      Poly2.warn(`hook with name ${param_name} already exists`, this.node);
    }
  }
  run_post_create_params_hooks() {
    if (this._post_create_params_hooks) {
      for (let hook of this._post_create_params_hooks) {
        hook();
      }
    }
  }
  run_on_scene_load_hooks() {
    if (this._on_scene_load_hooks) {
      for (let hook of this._on_scene_load_hooks) {
        hook();
      }
    }
  }
}
