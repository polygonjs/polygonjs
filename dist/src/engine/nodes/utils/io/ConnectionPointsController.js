import {
  DEFAULT_CONNECTION_POINT_ENUM_MAP,
  create_connection_point
} from "./connections/ConnectionMap";
import {ConnectionPointsSpareParamsController as ConnectionPointsSpareParamsController2} from "./ConnectionPointsSpareParamsController";
import {NetworkChildNodeType} from "../../../poly/NodeContext";
export class ConnectionPointsController {
  constructor(node, _context) {
    this.node = node;
    this._context = _context;
    this._create_spare_params_from_inputs = true;
    this._functions_overridden = false;
    this._input_name_function = (index) => {
      return `in${index}`;
    };
    this._output_name_function = (index) => {
      return index == 0 ? "val" : `val${index}`;
    };
    this._expected_input_types_function = () => {
      const type = this.first_input_connection_type() || this.default_connection_type();
      return [type, type];
    };
    this._expected_output_types_function = () => {
      return [this._expected_input_types_function()[0]];
    };
    this._update_signature_if_required_bound = this.update_signature_if_required.bind(this);
    this._initialized = false;
    this._spare_params_controller = new ConnectionPointsSpareParamsController2(this.node, this._context);
  }
  default_connection_type() {
    return DEFAULT_CONNECTION_POINT_ENUM_MAP[this._context];
  }
  create_connection_point(name, type) {
    return create_connection_point(this._context, name, type);
  }
  functions_overridden() {
    return this._functions_overridden;
  }
  initialized() {
    return this._initialized;
  }
  set_create_spare_params_from_inputs(state) {
    this._create_spare_params_from_inputs = state;
  }
  set_input_name_function(func) {
    this._initialize_if_required();
    this._input_name_function = func;
  }
  set_output_name_function(func) {
    this._initialize_if_required();
    this._output_name_function = func;
  }
  set_expected_input_types_function(func) {
    this._initialize_if_required();
    this._functions_overridden = true;
    this._expected_input_types_function = func;
  }
  set_expected_output_types_function(func) {
    this._initialize_if_required();
    this._functions_overridden = true;
    this._expected_output_types_function = func;
  }
  input_name(index) {
    return this._wrapped_input_name_function(index);
  }
  output_name(index) {
    return this._wrapped_output_name_function(index);
  }
  initialize_node() {
    if (this._initialized) {
      console.warn("already initialized", this.node);
      return;
    }
    this._initialized = true;
    this.node.io.inputs.add_on_set_input_hook("_update_signature_if_required", this._update_signature_if_required_bound);
    this.node.params.add_on_scene_load_hook("_update_signature_if_required", this._update_signature_if_required_bound);
    this.node.params.on_params_created("_update_signature_if_required_bound", this._update_signature_if_required_bound);
    this.node.add_post_dirty_hook("_update_signature_if_required", this._update_signature_if_required_bound);
    if (!this._spare_params_controller.initialized()) {
      this._spare_params_controller.initialize_node();
    }
  }
  _initialize_if_required() {
    if (!this._initialized) {
      this.initialize_node();
    }
  }
  get spare_params() {
    return this._spare_params_controller;
  }
  update_signature_if_required(dirty_trigger) {
    if (!this.node.lifecycle.creation_completed || !this._connections_match_inputs()) {
      this.update_connection_types();
      this.node.remove_dirty_state();
      if (!this.node.scene.loading_controller.is_loading) {
        this.make_successors_update_signatures();
      }
    }
  }
  make_successors_update_signatures() {
    const successors = this.node.graph_all_successors();
    if (this.node.children_allowed()) {
      const subnet_inputs = this.node.nodes_by_type(NetworkChildNodeType.INPUT);
      const subnet_outputs = this.node.nodes_by_type(NetworkChildNodeType.OUTPUT);
      for (let subnet_input of subnet_inputs) {
        successors.push(subnet_input);
      }
      for (let subnet_output of subnet_outputs) {
        successors.push(subnet_output);
      }
    }
    for (let graph_node of successors) {
      const node = graph_node;
      if (node.io && node.io.has_connection_points_controller && node.io.connection_points.initialized()) {
        node.io.connection_points.update_signature_if_required(this.node);
      }
    }
  }
  update_connection_types() {
    const set_dirty = false;
    const expected_input_types = this._wrapped_expected_input_types_function();
    const expected_output_types = this._wrapped_expected_output_types_function();
    const named_input_connection_points = [];
    for (let i = 0; i < expected_input_types.length; i++) {
      const type = expected_input_types[i];
      const point = this.create_connection_point(this._wrapped_input_name_function(i), type);
      named_input_connection_points.push(point);
    }
    const named_output_connect_points = [];
    for (let i = 0; i < expected_output_types.length; i++) {
      const type = expected_output_types[i];
      const point = this.create_connection_point(this._wrapped_output_name_function(i), type);
      named_output_connect_points.push(point);
    }
    this.node.io.inputs.set_named_input_connection_points(named_input_connection_points);
    this.node.io.outputs.set_named_output_connection_points(named_output_connect_points, set_dirty);
    if (this._create_spare_params_from_inputs) {
      this._spare_params_controller.create_spare_parameters();
    }
  }
  _connections_match_inputs() {
    const current_input_types = this.node.io.inputs.named_input_connection_points.map((c) => c?.type);
    const current_output_types = this.node.io.outputs.named_output_connection_points.map((c) => c?.type);
    const expected_input_types = this._wrapped_expected_input_types_function();
    const expected_output_types = this._wrapped_expected_output_types_function();
    if (expected_input_types.length != current_input_types.length) {
      return false;
    }
    if (expected_output_types.length != current_output_types.length) {
      return false;
    }
    for (let i = 0; i < current_input_types.length; i++) {
      if (current_input_types[i] != expected_input_types[i]) {
        return false;
      }
    }
    for (let i = 0; i < current_output_types.length; i++) {
      if (current_output_types[i] != expected_output_types[i]) {
        return false;
      }
    }
    return true;
  }
  _wrapped_expected_input_types_function() {
    if (this.node.scene.loading_controller.is_loading) {
      const in_data = this.node.io.saved_connection_points_data.in();
      if (in_data) {
        return in_data.map((d) => d.type);
      }
    }
    return this._expected_input_types_function();
  }
  _wrapped_expected_output_types_function() {
    if (this.node.scene.loading_controller.is_loading) {
      const out_data = this.node.io.saved_connection_points_data.out();
      if (out_data) {
        return out_data.map((d) => d.type);
      }
    }
    return this._expected_output_types_function();
  }
  _wrapped_input_name_function(index) {
    if (this.node.scene.loading_controller.is_loading) {
      const in_data = this.node.io.saved_connection_points_data.in();
      if (in_data) {
        return in_data[index].name;
      }
    }
    return this._input_name_function(index);
  }
  _wrapped_output_name_function(index) {
    if (this.node.scene.loading_controller.is_loading) {
      const out_data = this.node.io.saved_connection_points_data.out();
      if (out_data) {
        return out_data[index].name;
      }
    }
    return this._output_name_function(index);
  }
  first_input_connection_type() {
    return this.input_connection_type(0);
  }
  input_connection_type(index) {
    const connections = this.node.io.connections.input_connections();
    if (connections) {
      const connection = connections[index];
      if (connection) {
        return connection.src_connection_point().type;
      }
    }
  }
}
