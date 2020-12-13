import {TypedNode} from "../_Base";
import {NodeContext as NodeContext2} from "../../poly/NodeContext";
import {MapUtils as MapUtils2} from "../../../core/MapUtils";
export class TypedEventNode extends TypedNode {
  constructor() {
    super(...arguments);
    this._cook_without_inputs_bound = this._cook_without_inputs.bind(this);
  }
  static node_context() {
    return NodeContext2.EVENT;
  }
  initialize_base_node() {
    this.ui_data.set_layout_horizontal();
    this.add_post_dirty_hook("cook_without_inputs_on_dirty", this._cook_without_inputs_bound);
    this.io.inputs.set_depends_on_inputs(false);
    this.io.connections.init_inputs();
    this.io.connection_points.spare_params.initialize_node();
  }
  _cook_without_inputs() {
    this.cook_controller.cook_main_without_inputs();
  }
  cook() {
    this.cook_controller.end_cook();
  }
  process_event_via_connection_point(event_context, connection_point) {
    if (connection_point.event_listener) {
      connection_point.event_listener(event_context);
    } else {
      this.process_event(event_context);
    }
  }
  process_event(event_context) {
  }
  async dispatch_event_to_output(output_name, event_context) {
    this.run_on_dispatch_hook(output_name, event_context);
    const index = this.io.outputs.get_output_index(output_name);
    if (index >= 0) {
      const connections = this.io.connections.output_connections();
      const current_connections = connections.filter((connection) => connection.output_index == index);
      let dest_node;
      for (let connection of current_connections) {
        dest_node = connection.node_dest;
        const connection_point = dest_node.io.inputs.named_input_connection_points[connection.input_index];
        dest_node.process_event_via_connection_point(event_context, connection_point);
      }
    } else {
      console.warn(`requested output '${output_name}' does not exist on node '${this.full_path()}'`);
    }
  }
  on_dispatch(output_name, callback) {
    this._on_dispatch_hooks_by_output_name = this._on_dispatch_hooks_by_output_name || new Map();
    MapUtils2.push_on_array_at_entry(this._on_dispatch_hooks_by_output_name, output_name, callback);
  }
  run_on_dispatch_hook(output_name, event_context) {
    if (this._on_dispatch_hooks_by_output_name) {
      const hooks = this._on_dispatch_hooks_by_output_name.get(output_name);
      if (hooks) {
        for (let hook of hooks) {
          hook(event_context);
        }
      }
    }
  }
}
export class BaseEventNodeClass extends TypedEventNode {
}
