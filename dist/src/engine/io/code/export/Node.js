import lodash_sortBy from "lodash/sortBy";
import {SceneCodeExporter} from "./Scene";
import {NodesCodeExporter} from "./Nodes";
import {CodeExporterDispatcher} from "./Dispatcher";
export class NodeCodeExporter {
  constructor(_node) {
    this._node = _node;
    this._lines = [];
  }
  create(parent_var_name) {
    this.reset();
    if (!this.is_root()) {
      this.add_create(parent_var_name);
      this.add_name();
    }
    this.add_children();
    this.add_selection();
    this.add_comment();
    this.add_position({});
    this.add_input_clonable_state();
    this.add_flags();
    this.add_params();
    this.add_custom();
    return this._lines;
  }
  set_up(options = {}) {
    this.reset();
    this.add_input();
    return this._lines;
  }
  create_function_declare(parent_var_name = "parent") {
    this._node.scene.nodes_controller.register_node_context_signature(this._node);
    const ls = [];
    ls.push(`function ${this.function_name()}(${parent_var_name}){`);
    this.create(parent_var_name).forEach((l) => {
      ls.push(`	${l}`);
    });
    ls.push(`	return ${this.var_name()}`);
    ls.push(`}`);
    return ls;
  }
  create_function_call(parent_var_name) {
    if (parent_var_name == null) {
      if (this._node.parent) {
        parent_var_name = CodeExporterDispatcher.dispatch_node(this._node.parent).var_name();
      }
    }
    return `var ${this.var_name()} = ${this.function_name()}(${parent_var_name})`;
  }
  var_name() {
    if (this.is_root()) {
      const scene_exporter = new SceneCodeExporter(this._node.scene);
      return `${scene_exporter.var_name()}.root`;
    } else {
      return this._node.name.replace(/\//g, "_");
    }
  }
  function_name() {
    return "create_" + this.var_name().replace(/[^a-z0-9]/gim, "_");
  }
  is_root() {
    return this._node.parent === null && this._node.graph_node_id == this._node.root.graph_node_id;
  }
  reset() {
    this._lines = [];
  }
  add_create(parent_var_name) {
    if (parent_var_name == null) {
      if (this._node.parent) {
        const parent_exporter = CodeExporterDispatcher.dispatch_node(this._node.parent);
        parent_var_name = parent_exporter.var_name();
      }
    }
    const create_node_line = `var ${this.var_name()} = ${parent_var_name}.create_node('${this._node.type}')`;
    this._lines.push(create_node_line);
  }
  add_name() {
    if (this._node.graph_node_id !== this._node.root.graph_node_id) {
      this._lines.push(`${this.var_name()}.set_name('${this._node.name}')`);
    }
  }
  add_input() {
    this._node.io.inputs.inputs().forEach((input, input_index) => {
      const input_connection = this._node.io.connections.input_connection(input_index);
      if (input && input_connection) {
        const output_index = input_connection.output_index;
        const input_exporter = CodeExporterDispatcher.dispatch_node(input);
        let line;
        if (this._node.io.inputs.has_named_inputs) {
          const input_connection_point_name = this._node.io.inputs.named_input_connection_points[input_index].name;
          const output_name = input.io.outputs.named_output_connection_points[output_index].name;
          line = `${this.var_name()}.set_input('${input_connection_point_name}', ${input_exporter.var_name()}, '${output_name}')`;
        } else {
          line = `${this.var_name()}.set_input(${input_index}, ${input_exporter.var_name()})`;
        }
        this._lines.push(line);
      }
    });
  }
  add_comment() {
    if (this._node.parent) {
      let comment = this._node.ui_data.comment;
      if (comment) {
        comment = SceneCodeExporter.sanitize_string(comment);
        this._lines.push(`${this.var_name()}.ui_data.set_comment('${comment}')`);
      }
    }
  }
  add_position(options = {}) {
    if (this._node.parent) {
      let x_offset;
      const pos = this._node.ui_data.position.clone();
      if ((x_offset = options["position_x_offset"]) != null) {
        pos.x += x_offset;
      }
      this._lines.push(`${this.var_name()}.ui_data.set_position(${pos.x}, ${pos.y})`);
    }
  }
  add_params() {
    this._node.params.all.forEach((param) => {
      const param_exporter = CodeExporterDispatcher.dispatch_param(param);
      const param_lines = param_exporter.process();
      param_lines.forEach((param_line) => {
        this._lines.push(param_line);
      });
    });
    this._lines.push(`${this.var_name()}.params._update_caches()`);
    this._lines.push(`${this.var_name()}.params.run_on_scene_load_hooks()`);
  }
  add_input_clonable_state() {
    if (this._node.io.inputs.override_cloned_state_allowed()) {
      const overriden = this._node.io.inputs.cloned_state_overriden();
      if (overriden) {
        this._lines.push(`${this.var_name()}.io.inputs.override_cloned_state(true)`);
      }
    }
  }
  add_flags() {
    this.add_bypass_flag();
    this.add_display_flag();
    this.add_optimize_flag();
  }
  add_bypass_flag() {
    if (this._node.flags?.has_bypass()) {
      if (this._node.flags.bypass?.active) {
        this._lines.push(`${this.var_name()}.flags.bypass.set(true)`);
      }
    }
  }
  add_display_flag() {
    if (this._node.flags?.has_display()) {
      const active = this._node.flags.display?.active;
      if (this._node.parent?.display_node_controller) {
        if (active) {
          this._lines.push(`${this.var_name()}.flags.display.set(true)`);
        }
      } else {
        this._lines.push(`${this.var_name()}.flags.display.set(${active})`);
      }
    }
  }
  add_optimize_flag() {
    if (this._node.flags?.has_optimize()) {
      const active = this._node.flags.optimize?.active;
      if (active) {
        this._lines.push(`${this.var_name()}.flags.optimize.set(true)`);
      }
    }
  }
  add_children() {
    const children = lodash_sortBy(this._node.children(), (child) => child.name);
    const nodes_exporter = new NodesCodeExporter(children);
    nodes_exporter.process(this.var_name()).forEach((child_line) => {
      this._lines.push(child_line);
    });
  }
  add_custom() {
  }
  add_selection() {
    if (this._node.children_controller?.selection != null) {
      for (let node of this._node.children_controller.selection.nodes()) {
        const node_exporter = CodeExporterDispatcher.dispatch_node(node);
        this._lines.push(`${this.var_name()}.children_controller.selection.add([${node_exporter.var_name()}])`);
      }
    }
  }
}
