import lodash_intersection from "lodash/intersection";
import lodash_clone from "lodash/clone";
import lodash_merge from "lodash/merge";
import {JsonExportDispatcher} from "../../../io/json/export/Dispatcher";
import {ParamType as ParamType2} from "../../../poly/ParamType";
export class AssemblerNodeSpareParamsController {
  constructor(_controller, _node) {
    this._controller = _controller;
    this._node = _node;
    this._deleted_params_data = new Map();
    this._created_spare_param_names = [];
    this._raw_input_serialized_by_param_name = new Map();
    this._init_value_serialized_by_param_name = new Map();
  }
  get assembler() {
    return this._controller.assembler;
  }
  create_spare_parameters() {
    const params_update_options = {};
    const param_configs = this.assembler.param_configs();
    const assembler_param_names = param_configs.map((c) => c.name);
    const spare_param_names_to_add = lodash_clone(assembler_param_names);
    const validation_result = this._validate_names(spare_param_names_to_add);
    if (validation_result == false) {
      return;
    }
    const spare_param_names_to_remove = lodash_clone(this._created_spare_param_names).concat(spare_param_names_to_add);
    spare_param_names_to_remove.forEach((param_name) => {
      const param = this._node.params.get(param_name);
      if (param) {
        this._raw_input_serialized_by_param_name.set(param.name, param.raw_input_serialized);
        this._init_value_serialized_by_param_name.set(param.name, param.default_value_serialized);
        const param_exporter = JsonExportDispatcher.dispatch_param(param);
        if (param_exporter.required) {
          const params_data = param_exporter.data();
          this._deleted_params_data.set(param.name, params_data);
        }
      }
      params_update_options.names_to_delete = params_update_options.names_to_delete || [];
      params_update_options.names_to_delete.push(param_name);
    });
    for (let param_config of param_configs) {
      if (spare_param_names_to_add.indexOf(param_config.name) >= 0) {
        const config_options = lodash_clone(param_config.param_options);
        const default_options = {
          spare: true,
          compute_on_dirty: true,
          cook: false
        };
        const options = lodash_merge(config_options, default_options);
        let init_value = this._init_value_serialized_by_param_name.get(param_config.name);
        if (init_value == null) {
          init_value = param_config.default_value;
        }
        let raw_input = this._raw_input_serialized_by_param_name.get(param_config.name);
        if (raw_input == null) {
          raw_input = param_config.default_value;
        }
        params_update_options.to_add = params_update_options.to_add || [];
        params_update_options.to_add.push({
          name: param_config.name,
          type: param_config.type,
          init_value,
          raw_input,
          options
        });
      }
    }
    this._node.params.update_params(params_update_options);
    this._created_spare_param_names = params_update_options.to_add?.map((o) => o.name) || [];
    for (let param_config of param_configs) {
      const param = this._node.params.get(param_config.name);
      if (param) {
        param_config.execute_callback(this._node, param);
        if (param.type == ParamType2.OPERATOR_PATH) {
          setTimeout(async () => {
            if (param.is_dirty) {
              await param.compute();
            }
            param.options.execute_callback();
          }, 200);
        }
      }
    }
  }
  _validate_names(spare_param_names_to_add) {
    const current_param_names = lodash_clone(this._node.params.non_spare_names);
    const spare_params_with_same_name_as_params = lodash_intersection(spare_param_names_to_add, current_param_names);
    if (spare_params_with_same_name_as_params.length > 0) {
      const error_message = `${this._node.full_path()} attempts to create spare params called '${spare_params_with_same_name_as_params.join(", ")}' with same name as params`;
      this._node.states.error.set(error_message);
      return false;
    }
    return true;
  }
}
