import {SceneJsonExporter} from "./Scene";
import {JsonExportDispatcher} from "./Dispatcher";
export class NodeJsonExporter {
  constructor(_node) {
    this._node = _node;
  }
  data() {
    if (!this.is_root()) {
      this._node.scene.nodes_controller.register_node_context_signature(this._node);
    }
    this._data = {
      type: this._node.type
    };
    const nodes_data = this.nodes_data();
    if (Object.keys(nodes_data).length > 0) {
      this._data["nodes"] = nodes_data;
    }
    if (!this.is_root()) {
      const params_data = this.params_data();
      if (Object.keys(params_data).length > 0) {
        this._data["params"] = params_data;
      }
      const inputs_data = this.inputs_data();
      if (inputs_data.length > 0) {
        this._data["inputs"] = inputs_data;
      }
      const connection_points_data = this.connection_points_data();
      if (connection_points_data) {
        this._data["connection_points"] = connection_points_data;
      }
    }
    if (this._node.flags) {
      const flags_data = {};
      if (this._node.flags.has_bypass() || this._node.flags.has_display() || this._node.flags.has_optimize()) {
        if (this._node.flags.has_bypass()) {
          if (this._node.flags.bypass?.active) {
            flags_data["bypass"] = this._node.flags.bypass.active;
          }
        }
        if (this._node.flags.has_display()) {
          if (this._node.flags.display?.active || !this._node.parent?.display_node_controller) {
            flags_data["display"] = this._node.flags.display?.active;
          }
        }
        if (this._node.flags.has_optimize()) {
          if (this._node.flags.optimize?.active) {
            flags_data["optimize"] = this._node.flags.optimize?.active;
          }
        }
      }
      if (Object.keys(flags_data).length > 0) {
        this._data["flags"] = flags_data;
      }
    }
    if (this._node.children_allowed()) {
      const selection = this._node.children_controller?.selection;
      if (selection && this._node.children().length > 0) {
        const selected_children = [];
        const selected_ids = {};
        for (let selected_node of selection.nodes()) {
          selected_ids[selected_node.graph_node_id] = true;
        }
        for (let child of this._node.children()) {
          if (child.graph_node_id in selected_ids) {
            selected_children.push(child);
          }
        }
        const selection_data = selected_children.map((n) => n.name);
        if (selection_data.length > 0) {
          this._data["selection"] = selection_data;
        }
      }
    }
    if (this._node.io.inputs.override_cloned_state_allowed()) {
      const overriden = this._node.io.inputs.cloned_state_overriden();
      if (overriden) {
        this._data["cloned_state_overriden"] = overriden;
      }
    }
    if (this._node.persisted_config) {
      const persisted_config_data = this._node.persisted_config.to_json();
      if (persisted_config_data) {
        this._data.persisted_config = persisted_config_data;
      }
    }
    this.add_custom();
    return this._data;
  }
  ui_data() {
    const data = {};
    if (!this.is_root()) {
      const ui_data = this._node.ui_data;
      data["pos"] = ui_data.position.toArray();
      const comment = ui_data.comment;
      if (comment) {
        data["comment"] = SceneJsonExporter.sanitize_string(comment);
      }
    }
    const children = this._node.children();
    if (children.length > 0) {
      data["nodes"] = {};
      children.forEach((child) => {
        const node_exporter = JsonExportDispatcher.dispatch_node(child);
        data["nodes"][child.name] = node_exporter.ui_data();
      });
    }
    return data;
  }
  is_root() {
    return this._node.parent === null && this._node.graph_node_id == this._node.root.graph_node_id;
  }
  inputs_data() {
    const data = [];
    this._node.io.inputs.inputs().forEach((input, input_index) => {
      if (input) {
        const connection = this._node.io.connections.input_connection(input_index);
        if (this._node.io.inputs.has_named_inputs) {
          const output_index = connection.output_index;
          const output_name = input.io.outputs.named_output_connection_points[output_index]?.name;
          if (output_name) {
            data[input_index] = {
              index: input_index,
              node: input.name,
              output: output_name
            };
          }
        } else {
          data[input_index] = input.name;
        }
      }
    });
    return data;
  }
  connection_points_data() {
    if (!this._node.io.has_connection_points_controller) {
      return;
    }
    if (!this._node.io.connection_points.initialized()) {
      return;
    }
    if (this._node.io.inputs.has_named_inputs || this._node.io.outputs.has_named_outputs) {
      const data = {};
      if (this._node.io.inputs.has_named_inputs) {
        data["in"] = [];
        for (let cp of this._node.io.inputs.named_input_connection_points) {
          if (cp) {
            data["in"].push(cp.to_json());
          }
        }
      }
      if (this._node.io.outputs.has_named_outputs) {
        data["out"] = [];
        for (let cp of this._node.io.outputs.named_output_connection_points) {
          if (cp) {
            data["out"].push(cp.to_json());
          }
        }
      }
      return data;
    }
  }
  params_data() {
    const data = {};
    for (let param_name of this._node.params.names) {
      const param = this._node.params.get(param_name);
      if (param && !param.parent_param) {
        const param_exporter = JsonExportDispatcher.dispatch_param(param);
        if (param_exporter.required) {
          const params_data = param_exporter.data();
          data[param.name] = params_data;
        }
      }
    }
    return data;
  }
  nodes_data() {
    const data = {};
    for (let child of this._node.children()) {
      const node_exporter = JsonExportDispatcher.dispatch_node(child);
      data[child.name] = node_exporter.data();
    }
    return data;
  }
  add_custom() {
  }
}
