export class NodeSerializer {
  constructor(node) {
    this.node = node;
  }
  to_json(include_param_components = false) {
    const data = {
      name: this.node.name,
      type: this.node.type,
      graph_node_id: this.node.graph_node_id,
      is_dirty: this.node.is_dirty,
      ui_data_json: this.node.ui_data.to_json(),
      error_message: this.node.states.error.message,
      children: this.children_ids(),
      inputs: this.input_ids(),
      input_connection_output_indices: this.input_connection_output_indices(),
      named_input_connection_points: this.named_input_connection_points(),
      named_output_connection_points: this.named_output_connection_points(),
      param_ids: this.to_json_params(include_param_components),
      override_cloned_state_allowed: this.node.io.inputs.override_cloned_state_allowed(),
      inputs_clone_required_states: this.node.io.inputs.clone_required_states(),
      flags: {
        display: this.node.flags?.display?.active,
        bypass: this.node.flags?.bypass?.active,
        optimize: this.node.flags?.optimize?.active
      },
      selection: void 0
    };
    if (this.node.children_allowed() && this.node.children_controller) {
      data["selection"] = this.node.children_controller.selection.to_json();
    }
    return data;
  }
  children_ids() {
    return this.node.children().map((node) => node.graph_node_id);
  }
  input_ids() {
    return this.node.io.inputs.inputs().map((node) => node != null ? node.graph_node_id : void 0);
  }
  input_connection_output_indices() {
    return this.node.io.connections.input_connections()?.map((connection) => connection != null ? connection.output_index : void 0);
  }
  named_input_connection_points() {
    return this.node.io.inputs.named_input_connection_points.map((i) => i.to_json());
  }
  named_output_connection_points() {
    return this.node.io.outputs.named_output_connection_points.map((o) => o.to_json());
  }
  to_json_params_from_names(param_names, include_components = false) {
    return param_names.map((param_name) => {
      return this.node.params.get(param_name).graph_node_id;
    });
  }
  to_json_params(include_components = false) {
    return this.to_json_params_from_names(this.node.params.names, include_components);
  }
}
