import {TypedNode} from "../../_Base";
import {GlobalsGeometryHandler} from "./globals/Geometry";
import {AssemblerNodeSpareParamsController} from "./SpareParamsController";
export class BaseGlParentNode extends TypedNode {
  create_node(type, params_init_value_overrides) {
    return super.create_node(type, params_init_value_overrides);
  }
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
export class AssemblerControllerNode extends BaseGlParentNode {
}
export class GlAssemblerController {
  constructor(node, assembler_class) {
    this.node = node;
    this._globals_handler = new GlobalsGeometryHandler();
    this._compile_required = true;
    this._assembler = new assembler_class(this.node);
    this._spare_params_controller = new AssemblerNodeSpareParamsController(this, this.node);
  }
  set_assembler_globals_handler(globals_handler) {
    const current_id = this._globals_handler ? this._globals_handler.id() : null;
    const new_id = globals_handler ? globals_handler.id() : null;
    if (current_id != new_id) {
      this._globals_handler = globals_handler;
      this.set_compilation_required_and_dirty();
      this._assembler.reset_configs();
    }
  }
  get assembler() {
    return this._assembler;
  }
  get globals_handler() {
    return this._globals_handler;
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
    const current_global = this.node.nodes_by_type("globals")[0];
    const current_output = this.node.nodes_by_type("output")[0];
    if (current_global || current_output) {
      return;
    }
    const globals = this.node.create_node("globals");
    const output = this.node.create_node("output");
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
