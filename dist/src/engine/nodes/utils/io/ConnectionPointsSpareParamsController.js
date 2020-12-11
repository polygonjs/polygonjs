import {
  param_type_to_connection_point_type_map,
  create_connection_point
} from "./connections/ConnectionMap";
import lodash_clone from "lodash/clone";
import lodash_isArray from "lodash/isArray";
import lodash_isNumber from "lodash/isNumber";
export class ConnectionPointsSpareParamsController {
  constructor(node, _context) {
    this.node = node;
    this._context = _context;
    this._raw_input_serialized_by_param_name = new Map();
    this._default_value_serialized_by_param_name = new Map();
    this._initialized = false;
  }
  initialize_node() {
    if (this._initialized) {
      console.warn("already initialized", this.node);
      return;
    }
    this._initialized = true;
    this.node.params.on_params_created("create_inputs_from_params", this.create_inputs_from_params.bind(this));
  }
  initialized() {
    return this._initialized;
  }
  create_inputs_from_params() {
    const connection_type_map = param_type_to_connection_point_type_map(this._context);
    if (!connection_type_map) {
      return;
    }
    const connection_points = [];
    for (let param_name of this.node.params.names) {
      let add_input = true;
      if (this._inputless_param_names && this._inputless_param_names.length > 0 && this._inputless_param_names.includes(param_name)) {
        add_input = false;
      }
      if (add_input) {
        if (this.node.params.has(param_name)) {
          const param = this.node.params.get(param_name);
          if (param && !param.parent_param) {
            const connection_type = connection_type_map[param.type];
            if (connection_type) {
              const connection_point = create_connection_point(this._context, param.name, connection_type);
              if (connection_point) {
                connection_points.push(connection_point);
              }
            }
          }
        }
      }
    }
    this.node.io.inputs.set_named_input_connection_points(connection_points);
  }
  set_inputless_param_names(names) {
    return this._inputless_param_names = names;
  }
  create_spare_parameters() {
    if (this.node.scene.loading_controller.is_loading) {
      return;
    }
    const current_param_names = this.node.params.spare_names;
    const params_update_options = {};
    for (let param_name of current_param_names) {
      if (this.node.params.has(param_name)) {
        const param = this.node.params.get(param_name);
        if (param) {
          this._raw_input_serialized_by_param_name.set(param_name, param.raw_input_serialized);
          this._default_value_serialized_by_param_name.set(param_name, param.default_value_serialized);
          params_update_options.names_to_delete = params_update_options.names_to_delete || [];
          params_update_options.names_to_delete.push(param_name);
        }
      }
    }
    for (let connection_point of this.node.io.inputs.named_input_connection_points) {
      if (connection_point) {
        const param_name = connection_point.name;
        const param_type = connection_point.param_type;
        let init_value = connection_point.init_value;
        const last_param_init_value = this._default_value_serialized_by_param_name.get(param_name);
        let default_value_from_name = this.node.param_default_value(param_name);
        if (default_value_from_name != null) {
          init_value = default_value_from_name;
        } else {
          if (last_param_init_value != null) {
            init_value = last_param_init_value;
          } else {
            init_value = connection_point.init_value;
          }
        }
        if (lodash_isArray(connection_point.init_value)) {
          if (lodash_isNumber(init_value)) {
            const array = new Array(connection_point.init_value.length);
            array.fill(init_value);
            init_value = array;
          } else if (lodash_isArray(init_value)) {
            if (init_value.length == connection_point.init_value.length) {
              if (last_param_init_value != null) {
                init_value = connection_point.init_value;
              }
            }
          }
        }
        if (init_value != null) {
          params_update_options.to_add = params_update_options.to_add || [];
          params_update_options.to_add.push({
            name: param_name,
            type: param_type,
            init_value: lodash_clone(init_value),
            raw_input: lodash_clone(init_value),
            options: {
              spare: true
            }
          });
        }
      }
    }
    this.node.params.update_params(params_update_options);
    for (let spare_param of this.node.params.spare) {
      if (!spare_param.parent_param) {
        const raw_input = this._raw_input_serialized_by_param_name.get(spare_param.name);
        if (raw_input) {
          spare_param.set(raw_input);
        }
      }
    }
  }
}
