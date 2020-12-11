import lodash_isString from "lodash/isString";
import {ParamJsonImporter} from "./Param";
import {Poly as Poly2} from "../../../Poly";
import {OPERATIONS_COMPOSER_NODE_TYPE} from "../../../../core/operations/_Base";
export class OptimizedNodesJsonImporter {
  constructor(_node) {
    this._node = _node;
    this._nodes = [];
    this._optimized_root_node_names = new Set();
    this._operation_containers_by_name = new Map();
    this._node_inputs = [];
  }
  nodes() {
    return this._nodes;
  }
  process_data(scene_importer, data) {
    if (!data) {
      return;
    }
    if (!(this._node.children_allowed() && this._node.children_controller)) {
      return;
    }
    const {optimized_names} = OptimizedNodesJsonImporter.child_names_by_optimized_state(data);
    this._nodes = [];
    this._optimized_root_node_names = new Set();
    for (let node_name of optimized_names) {
      if (OptimizedNodesJsonImporter.is_optimized_root_node(data, node_name)) {
        this._optimized_root_node_names.add(node_name);
      }
    }
    for (let node_name of this._optimized_root_node_names) {
      const node_data = data[node_name];
      const node = this._node.create_node(OPERATIONS_COMPOSER_NODE_TYPE);
      if (node) {
        node.set_name(node_name);
        this._nodes.push(node);
        if (node_data.flags?.display) {
          node.flags?.display?.set(true);
        }
        const operation_container = this._create_operation_container(scene_importer, node, node_data, node.name);
        node.set_output_operation_container(operation_container);
      }
    }
    for (let node of this._nodes) {
      const operation_container = node.output_operation_container();
      if (operation_container) {
        this._node_inputs = [];
        this._add_optimized_node_inputs(scene_importer, node, data, node.name, operation_container);
        node.io.inputs.set_count(this._node_inputs.length);
        for (let i = 0; i < this._node_inputs.length; i++) {
          node.set_input(i, this._node_inputs[i]);
        }
      }
    }
  }
  _add_optimized_node_inputs(scene_importer, node, data, node_name, current_operation_container) {
    const node_data = data[node_name];
    const inputs_data = node_data["inputs"];
    if (!inputs_data) {
      return;
    }
    for (let input_data of inputs_data) {
      if (lodash_isString(input_data)) {
        const input_node_data = data[input_data];
        if (input_node_data) {
          if (OptimizedNodesJsonImporter.is_node_optimized(input_node_data) && !this._optimized_root_node_names.has(input_data)) {
            let operation_container = this._operation_containers_by_name.get(input_data);
            if (!operation_container) {
              operation_container = this._create_operation_container(scene_importer, node, input_node_data, input_data);
              if (operation_container) {
                this._add_optimized_node_inputs(scene_importer, node, data, input_data, operation_container);
              }
            }
            current_operation_container.add_input(operation_container);
          } else {
            const input_node = node.parent?.node(input_data);
            if (input_node) {
              this._node_inputs.push(input_node);
              const node_input_index = this._node_inputs.length - 1;
              node.add_input_config(current_operation_container, {
                operation_input_index: current_operation_container.current_input_index(),
                node_input_index
              });
              current_operation_container.increment_input_index();
            }
          }
        }
      }
    }
    if (node_data.cloned_state_overriden == true) {
      current_operation_container.override_input_clone_state(node_data.cloned_state_overriden);
    }
  }
  static child_names_by_optimized_state(data) {
    const node_names = Object.keys(data);
    const optimized_names = [];
    const non_optimized_names = [];
    for (let node_name of node_names) {
      const node_data = data[node_name];
      const optimized_state = Poly2.instance().player_mode() && this.is_node_optimized(node_data);
      if (optimized_state) {
        optimized_names.push(node_name);
      } else {
        non_optimized_names.push(node_name);
      }
    }
    return {optimized_names, non_optimized_names};
  }
  static is_optimized_root_node_generic(data) {
    if (data.outputs_count == 0) {
      return true;
    }
    if (data.non_optimized_count > 0) {
      return true;
    }
    return false;
  }
  static is_optimized_root_node(data, current_node_name) {
    const output_names = this.node_outputs(data, current_node_name);
    let non_optimized_count = 0;
    output_names.forEach((node_name) => {
      const node_data = data[node_name];
      if (!this.is_node_optimized(node_data)) {
        non_optimized_count++;
      }
    });
    return this.is_optimized_root_node_generic({
      outputs_count: output_names.size,
      non_optimized_count
    });
  }
  static is_optimized_root_node_from_node(node) {
    if (!node.flags?.optimize?.active) {
      return false;
    }
    const output_nodes = node.io.connections.output_connections().map((c) => c.node_dest);
    let non_optimized_count = 0;
    for (let output_node of output_nodes) {
      if (!output_node.flags?.optimize?.active) {
        non_optimized_count++;
      }
    }
    return this.is_optimized_root_node_generic({
      outputs_count: output_nodes.length,
      non_optimized_count
    });
  }
  static node_outputs(data, current_node_name) {
    const node_names = Object.keys(data);
    const output_node_names = new Set();
    for (let node_name of node_names) {
      if (node_name != current_node_name) {
        const node_data = data[node_name];
        const inputs = node_data["inputs"];
        if (inputs) {
          for (let input_data of inputs) {
            if (lodash_isString(input_data)) {
              const input_node_name = input_data;
              if (input_node_name == current_node_name) {
                output_node_names.add(node_name);
              }
            }
          }
        }
      }
    }
    return output_node_names;
  }
  _create_operation_container(scene_importer, node, node_data, node_name) {
    const non_spare_params_data = ParamJsonImporter.non_spare_params_data_value(node_data["params"]);
    const operation_type = OptimizedNodesJsonImporter.operation_type(node_data);
    const operation_container = this._node.create_operation_container(operation_type, node_name, non_spare_params_data);
    if (operation_container) {
      this._operation_containers_by_name.set(node_name, operation_container);
      if (operation_container.path_param_resolve_required()) {
        node.add_operation_container_with_path_param_resolve_required(operation_container);
        scene_importer.add_operations_composer_node_with_path_param_resolve_required(node);
      }
    }
    return operation_container;
  }
  static operation_type(node_data) {
    if (OptimizedNodesJsonImporter.is_node_bypassed(node_data)) {
      return "null";
    }
    return node_data["type"];
  }
  static is_node_optimized(node_data) {
    const node_flags = node_data["flags"];
    if (node_flags && node_flags["optimize"]) {
      return true;
    }
    return false;
  }
  static is_node_bypassed(node_data) {
    const node_flags = node_data["flags"];
    if (node_flags && node_flags["bypass"]) {
      return true;
    }
    return false;
  }
}
