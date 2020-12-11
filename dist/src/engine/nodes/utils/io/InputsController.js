import lodash_isString from "lodash/isString";
import {TypedNodeConnection} from "./NodeConnection";
import {CoreGraphNode as CoreGraphNode2} from "../../../../core/graph/CoreGraphNode";
import {NodeEvent as NodeEvent2} from "../../../poly/NodeEvent";
import {ClonedStatesController as ClonedStatesController2} from "./utils/ClonedStatesController";
export class InputsController {
  constructor(node) {
    this.node = node;
    this._graph_node_inputs = [];
    this._inputs = [];
    this._has_named_inputs = false;
    this._min_inputs_count = 0;
    this._max_inputs_count = 0;
    this._depends_on_inputs = true;
  }
  set_depends_on_inputs(depends_on_inputs) {
    this._depends_on_inputs = depends_on_inputs;
  }
  set_min_inputs_count(min_inputs_count) {
    this._min_inputs_count = min_inputs_count;
  }
  set_max_inputs_count(max_inputs_count) {
    this._max_inputs_count = max_inputs_count;
    this.init_graph_node_inputs();
  }
  named_input_connection_points_by_name(name) {
    if (this._named_input_connection_points) {
      for (let connection_point of this._named_input_connection_points) {
        if (connection_point && connection_point.name == name) {
          return connection_point;
        }
      }
    }
  }
  set_named_input_connection_points(connection_points) {
    this._has_named_inputs = true;
    const connections = this.node.io.connections.input_connections();
    if (connections) {
      for (let connection of connections) {
        if (connection) {
          if (connection.input_index >= connection_points.length) {
            connection.disconnect({set_input: true});
          }
        }
      }
    }
    this._named_input_connection_points = connection_points;
    this.set_min_inputs_count(0);
    this.set_max_inputs_count(connection_points.length);
    this.init_graph_node_inputs();
    this.node.emit(NodeEvent2.NAMED_INPUTS_UPDATED);
  }
  get has_named_inputs() {
    return this._has_named_inputs;
  }
  get named_input_connection_points() {
    return this._named_input_connection_points || [];
  }
  init_graph_node_inputs() {
    for (let i = 0; i < this._max_inputs_count; i++) {
      this._graph_node_inputs[i] = this._graph_node_inputs[i] || this._create_graph_node_input(i);
    }
  }
  _create_graph_node_input(index) {
    const graph_input_node = new CoreGraphNode2(this.node.scene, `input_${index}`);
    if (!this._graph_node) {
      this._graph_node = new CoreGraphNode2(this.node.scene, "inputs");
      this.node.add_graph_input(this._graph_node, false);
    }
    this._graph_node.add_graph_input(graph_input_node, false);
    return graph_input_node;
  }
  get max_inputs_count() {
    return this._max_inputs_count || 0;
  }
  input_graph_node(input_index) {
    return this._graph_node_inputs[input_index];
  }
  set_count(min, max) {
    if (max == null) {
      max = min;
    }
    this.set_min_inputs_count(min);
    this.set_max_inputs_count(max);
    this.init_connections_controller_inputs();
  }
  init_connections_controller_inputs() {
    this.node.io.connections.init_inputs();
  }
  is_any_input_dirty() {
    return this._graph_node?.is_dirty || false;
  }
  containers_without_evaluation() {
    const containers = [];
    for (let i = 0; i < this._inputs.length; i++) {
      containers.push(this._inputs[i]?.container_controller.container);
    }
    return containers;
  }
  existing_input_indices() {
    const existing_input_indices = [];
    if (this._max_inputs_count > 0) {
      for (let i = 0; i < this._inputs.length; i++) {
        if (this._inputs[i]) {
          existing_input_indices.push(i);
        }
      }
    }
    return existing_input_indices;
  }
  async eval_required_inputs() {
    let containers = [];
    if (this._max_inputs_count > 0) {
      const existing_input_indices = this.existing_input_indices();
      if (existing_input_indices.length < this._min_inputs_count) {
        this.node.states.error.set("inputs are missing");
      } else {
        if (existing_input_indices.length > 0) {
          const promises = [];
          let input;
          for (let i = 0; i < this._inputs.length; i++) {
            input = this._inputs[i];
            if (input) {
              promises.push(this.eval_required_input(i));
            }
          }
          containers = await Promise.all(promises);
          this._graph_node?.remove_dirty_state();
        }
      }
    }
    return containers;
  }
  async eval_required_input(input_index) {
    let container;
    const input_node = this.input(input_index);
    if (input_node && !input_node.is_dirty) {
      container = input_node.container_controller.container;
    } else {
      container = await this.node.container_controller.request_input_container(input_index);
      this._graph_node_inputs[input_index].remove_dirty_state();
    }
    if (container && container.core_content()) {
    } else {
      const input_node2 = this.input(input_index);
      if (input_node2) {
        const input_error_message = input_node2.states.error.message;
        if (input_error_message) {
          this.node.states.error.set(`input ${input_index} is invalid (error: ${input_error_message})`);
        }
      }
    }
    return container;
  }
  get_named_input_index(name) {
    if (this._named_input_connection_points) {
      for (let i = 0; i < this._named_input_connection_points.length; i++) {
        if (this._named_input_connection_points[i]?.name == name) {
          return i;
        }
      }
    }
    return -1;
  }
  get_input_index(input_index_or_name) {
    if (lodash_isString(input_index_or_name)) {
      if (this.has_named_inputs) {
        return this.get_named_input_index(input_index_or_name);
      } else {
        throw new Error(`node ${this.node.full_path()} has no named inputs`);
      }
    } else {
      return input_index_or_name;
    }
  }
  set_input(input_index_or_name, node, output_index_or_name = 0) {
    const input_index = this.get_input_index(input_index_or_name) || 0;
    if (input_index < 0) {
      const message = `invalid input (${input_index_or_name}) for node ${this.node.full_path()}`;
      console.warn(message);
      throw new Error(message);
    }
    let output_index = 0;
    if (node) {
      if (node.io.outputs.has_named_outputs) {
        output_index = node.io.outputs.get_output_index(output_index_or_name);
        if (output_index == null || output_index < 0) {
          const connection_points = node.io.outputs.named_output_connection_points;
          const names = connection_points.map((cp) => cp.name);
          console.warn(`node ${node.full_path()} does not have an output named ${output_index_or_name}. inputs are: ${names.join(", ")}`);
          return;
        }
      }
    }
    const graph_input_node = this._graph_node_inputs[input_index];
    if (graph_input_node == null) {
      const message = `graph_input_node not found at index ${input_index}`;
      console.warn(message);
      throw new Error(message);
    }
    if (node && this.node.parent != node.parent) {
      return;
    }
    const old_input_node = this._inputs[input_index];
    let old_output_index = null;
    let old_connection = void 0;
    if (this.node.io.connections) {
      old_connection = this.node.io.connections.input_connection(input_index);
    }
    if (old_connection) {
      old_output_index = old_connection.output_index;
    }
    if (node !== old_input_node || output_index != old_output_index) {
      if (old_input_node != null) {
        if (this._depends_on_inputs) {
          graph_input_node.remove_graph_input(old_input_node);
        }
      }
      if (node != null) {
        if (graph_input_node.add_graph_input(node)) {
          if (!this._depends_on_inputs) {
            graph_input_node.remove_graph_input(node);
          }
          if (old_connection) {
            old_connection.disconnect({set_input: false});
          }
          this._inputs[input_index] = node;
          new TypedNodeConnection(node, this.node, output_index, input_index);
        } else {
          console.warn(`cannot connect ${node.full_path()} to ${this.node.full_path()}`);
        }
      } else {
        this._inputs[input_index] = null;
        if (old_connection) {
          old_connection.disconnect({set_input: false});
        }
      }
      this._run_on_set_input_hooks();
      graph_input_node.set_successors_dirty();
      this.node.emit(NodeEvent2.INPUTS_UPDATED);
    }
  }
  remove_input(node) {
    const inputs = this.inputs();
    let input;
    for (let i = 0; i < inputs.length; i++) {
      input = inputs[i];
      if (input != null && node != null) {
        if (input.graph_node_id === node.graph_node_id) {
          this.set_input(i, null);
        }
      }
    }
  }
  input(input_index) {
    return this._inputs[input_index];
  }
  named_input(input_name) {
    if (this.has_named_inputs) {
      const input_index = this.get_input_index(input_name);
      return this._inputs[input_index];
    } else {
      return null;
    }
  }
  named_input_connection_point(input_name) {
    if (this.has_named_inputs && this._named_input_connection_points) {
      const input_index = this.get_input_index(input_name);
      return this._named_input_connection_points[input_index];
    }
  }
  has_named_input(name) {
    return this.get_named_input_index(name) >= 0;
  }
  has_input(input_index) {
    return this._inputs[input_index] != null;
  }
  inputs() {
    return this._inputs;
  }
  init_inputs_cloned_state(states) {
    if (!this._cloned_states_controller) {
      this._cloned_states_controller = new ClonedStatesController2(this);
      this._cloned_states_controller.init_inputs_cloned_state(states);
    }
  }
  override_cloned_state_allowed() {
    return this._cloned_states_controller?.override_cloned_state_allowed() || false;
  }
  override_cloned_state(state) {
    this._cloned_states_controller?.override_cloned_state(state);
  }
  cloned_state_overriden() {
    return this._cloned_states_controller?.overriden() || false;
  }
  clone_required(index) {
    const state = this._cloned_states_controller?.clone_required_state(index);
    if (state != null) {
      return state;
    }
    return true;
  }
  clone_required_states() {
    const states = this._cloned_states_controller?.clone_required_states();
    if (states != null) {
      return states;
    }
    return true;
  }
  add_on_set_input_hook(name, hook) {
    this._on_update_hooks = this._on_update_hooks || [];
    this._on_update_hook_names = this._on_update_hook_names || [];
    if (!this._on_update_hook_names.includes(name)) {
      this._on_update_hooks.push(hook);
      this._on_update_hook_names.push(name);
    } else {
      console.warn(`hook with name ${name} already exists`, this.node);
    }
  }
  _run_on_set_input_hooks() {
    if (this._on_update_hooks) {
      for (let hook of this._on_update_hooks) {
        hook();
      }
    }
  }
}
