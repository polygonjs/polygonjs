import {TypedNode} from "../../_Base";
import {JsAssemblerNodeSpareParamsController} from "./SpareParamsController";
export class AssemblerControllerNode extends TypedNode {
  createNode(node_class, params_init_value_overrides) {
    return super.createNode(node_class, params_init_value_overrides);
  }
  children() {
    return super.children();
  }
  nodes_by_type(type) {
    return super.nodes_by_type(type);
  }
}
export class JsAssemblerController {
  constructor(node, assembler_class) {
    this.node = node;
    this._compile_required = true;
    this._assembler = new assembler_class(this.node);
    this._spare_params_controller = new JsAssemblerNodeSpareParamsController(this, this.node);
  }
  get assembler() {
    return this._assembler;
  }
  add_output_inputs(output_child) {
    this._assembler.add_output_inputs(output_child);
  }
  add_globals_outputs(globals_node) {
    this._assembler.add_globals_outputs(globals_node);
  }
  allow_attribute_exports() {
    return this._assembler.allow_attribute_exports();
  }
  on_create() {
    const globals = this.node.createNode("globals");
    const output = this.node.createNode("output");
    globals.ui_data.set_position(-200, 0);
    output.ui_data.set_position(200, 0);
  }
  set_compilation_required(new_state = true) {
    this._compile_required = new_state;
  }
  set_compilation_required_and_dirty(trigger_node) {
    this.set_compilation_required();
    this.node.set_dirty(trigger_node);
  }
  compile_required() {
    return this._compile_required;
  }
  post_compile() {
    this.create_spare_parameters();
    this.set_compilation_required(false);
  }
  create_spare_parameters() {
    this._spare_params_controller.create_spare_parameters();
  }
}
