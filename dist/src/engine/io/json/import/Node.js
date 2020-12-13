import lodash_isString from "lodash/isString";
import lodash_isBoolean from "lodash/isBoolean";
import lodash_isObject from "lodash/isObject";
import lodash_isNumber from "lodash/isNumber";
import lodash_isArray from "lodash/isArray";
import {Vector2 as Vector22} from "three/src/math/Vector2";
import {JsonImportDispatcher} from "./Dispatcher";
import {NodesJsonImporter} from "./Nodes";
import {Poly as Poly2} from "../../../Poly";
const COMPLEX_PARAM_DATA_KEYS = ["overriden_options", "type"];
export class NodeJsonImporter {
  constructor(_node) {
    this._node = _node;
  }
  process_data(scene_importer, data) {
    this.set_connection_points(data["connection_points"]);
    if (this._node.children_allowed()) {
      this.create_nodes(scene_importer, data["nodes"]);
    }
    this.set_selection(data["selection"]);
    if (this._node.io.inputs.override_cloned_state_allowed()) {
      const override = data["cloned_state_overriden"];
      if (override) {
        this._node.io.inputs.override_cloned_state(override);
      }
    }
    this.set_flags(data);
    this.set_params(data["params"]);
    if (data.persisted_config) {
      this.set_persisted_config(data.persisted_config);
    }
    this.from_data_custom(data);
  }
  process_inputs_data(data) {
    this.set_inputs(data["inputs"]);
  }
  process_ui_data(scene_importer, data) {
    if (!data) {
      return;
    }
    if (Poly2.instance().player_mode()) {
      return;
    }
    const ui_data = this._node.ui_data;
    const pos = data["pos"];
    if (pos) {
      const vector = new Vector22().fromArray(pos);
      ui_data.set_position(vector);
    }
    const comment = data["comment"];
    if (comment) {
      ui_data.set_comment(comment);
    }
    if (this._node.children_allowed()) {
      this.process_nodes_ui_data(scene_importer, data["nodes"]);
    }
  }
  create_nodes(scene_importer, data) {
    if (!data) {
      return;
    }
    const nodes_importer = new NodesJsonImporter(this._node);
    nodes_importer.process_data(scene_importer, data);
  }
  set_selection(data) {
    if (this._node.children_allowed() && this._node.children_controller) {
      if (data && data.length > 0) {
        const selected_nodes = [];
        data.forEach((node_name) => {
          const node = this._node.node(node_name);
          if (node) {
            selected_nodes.push(node);
          }
        });
        this._node.children_controller.selection.set(selected_nodes);
      }
    }
  }
  set_flags(data) {
    const flags = data["flags"];
    if (flags) {
      const bypass = flags["bypass"];
      if (bypass != null) {
        this._node.flags?.bypass?.set(bypass);
      }
      const display = flags["display"];
      if (display != null) {
        this._node.flags?.display?.set(display);
      }
      const optimize = flags["optimize"];
      if (optimize != null) {
        this._node.flags?.optimize?.set(optimize);
      }
    }
  }
  set_connection_points(connection_points_data) {
    if (!connection_points_data) {
      return;
    }
    if (connection_points_data["in"]) {
      this._node.io.saved_connection_points_data.set_in(connection_points_data["in"]);
    }
    if (connection_points_data["out"]) {
      this._node.io.saved_connection_points_data.set_out(connection_points_data["out"]);
    }
    if (this._node.io.has_connection_points_controller) {
      this._node.io.connection_points.update_signature_if_required();
    }
  }
  set_inputs(inputs_data) {
    if (!inputs_data) {
      return;
    }
    let input_data;
    for (let i = 0; i < inputs_data.length; i++) {
      input_data = inputs_data[i];
      if (input_data && this._node.parent) {
        if (lodash_isString(input_data)) {
          const input_node_name = input_data;
          const input_node = this._node.node_sibbling(input_node_name);
          this._node.set_input(i, input_node);
        } else {
          const input_node = this._node.node_sibbling(input_data["node"]);
          const input_index = input_data["index"];
          this._node.set_input(input_index, input_node, input_data["output"]);
        }
      }
    }
  }
  process_nodes_ui_data(scene_importer, data) {
    if (!data) {
      return;
    }
    if (Poly2.instance().player_mode()) {
      return;
    }
    const node_names = Object.keys(data);
    node_names.forEach((node_name) => {
      const node = this._node.node(node_name);
      if (node) {
        const node_data = data[node_name];
        JsonImportDispatcher.dispatch_node(node).process_ui_data(scene_importer, node_data);
      }
    });
  }
  set_params(data) {
    if (!data) {
      return;
    }
    const param_names = Object.keys(data);
    const params_update_options = {};
    for (let param_name of param_names) {
      const param_data = data[param_name];
      const options = param_data["options"];
      const param_type = param_data["type"];
      const has_param = this._node.params.has_param(param_name);
      let has_param_and_same_type = false;
      let param;
      if (has_param) {
        param = this._node.params.get(param_name);
        if (param && param.type == param_type || param_type == null) {
          has_param_and_same_type = true;
        }
      }
      if (has_param_and_same_type) {
        if (this._is_param_data_complex(param_data)) {
          this._process_param_data_complex(param_name, param_data);
        } else {
          this._process_param_data_simple(param_name, param_data);
        }
      } else {
        params_update_options.names_to_delete = params_update_options.names_to_delete || [];
        params_update_options.names_to_delete.push(param_name);
        params_update_options.to_add = params_update_options.to_add || [];
        params_update_options.to_add.push({
          name: param_name,
          type: param_type,
          init_value: param_data["default_value"],
          raw_input: param_data["raw_input"],
          options
        });
      }
    }
    const params_delete_required = params_update_options.names_to_delete && params_update_options.names_to_delete.length > 0;
    const params_add_required = params_update_options.to_add && params_update_options.to_add.length > 0;
    if (params_delete_required || params_add_required) {
      this._node.params.update_params(params_update_options);
      for (let spare_param of this._node.params.spare) {
        const param_data = data[spare_param.name];
        if (!spare_param.parent_param && param_data) {
          if (this._is_param_data_complex(param_data)) {
            this._process_param_data_complex(spare_param.name, param_data);
          } else {
            this._process_param_data_simple(spare_param.name, param_data);
          }
        }
      }
    }
    this._node.params.run_on_scene_load_hooks();
  }
  _process_param_data_simple(param_name, param_data) {
    this._node.params.get(param_name)?.set(param_data);
  }
  _process_param_data_complex(param_name, param_data) {
    const param = this._node.params.get(param_name);
    if (param) {
      JsonImportDispatcher.dispatch_param(param).process_data(param_data);
    }
  }
  _is_param_data_complex(param_data) {
    if (lodash_isString(param_data) || lodash_isNumber(param_data) || lodash_isArray(param_data) || lodash_isBoolean(param_data)) {
      return false;
    }
    if (lodash_isObject(param_data)) {
      const keys = Object.keys(param_data);
      for (let complex_key of COMPLEX_PARAM_DATA_KEYS) {
        if (keys.includes(complex_key)) {
          return true;
        }
      }
    }
    return false;
  }
  set_persisted_config(persisted_config_data) {
    if (this._node.persisted_config) {
      this._node.persisted_config.load(persisted_config_data);
    }
  }
  from_data_custom(data) {
  }
}
